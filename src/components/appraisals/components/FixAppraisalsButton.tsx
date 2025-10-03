import React, { useState } from 'react';
import { Wrench, AlertCircle, CheckCircle } from 'lucide-react';
import { AppraisalService } from '../../../services/appraisalService';
import { userService } from '../../../services/userService';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface FixAppraisalsButtonProps {
  onComplete: () => void;
}

export function FixAppraisalsButton({ onComplete }: FixAppraisalsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{ fixed: number; errors: number } | null>(null);

  const fixAppraisals = async () => {
    try {
      setLoading(true);
      const appraisals = await AppraisalService.getAppraisals();
      
      let fixed = 0;
      let errors = 0;

      for (const appraisal of appraisals) {
        // Check if managerId is missing, invalid, or same as employeeId
        const needsFixing = !appraisal.managerId || 
                           appraisal.managerId === 'unknown' || 
                           appraisal.managerId.trim() === '' ||
                           appraisal.managerId === appraisal.employeeId; // Self-assigned by mistake

        if (needsFixing) {
          try {
            // Get employee data to find their real manager
            const employee = await userService.getUser(appraisal.employeeId);
            let managerId = appraisal.employeeId; // Default fallback

            if (employee) {
              // First priority: check user's managerId field
              if (employee.managerId && typeof employee.managerId === 'string' && employee.managerId.trim() !== '') {
                managerId = employee.managerId;
                console.log(`Found manager in user data: ${managerId} for employee ${appraisal.employeeId}`);
              } else {
                // Second priority: try to get manager from team collection
                try {
                  const teamQuery = query(
                    collection(db, 'team'),
                    where('userId', '==', appraisal.employeeId)
                  );
                  const teamSnapshot = await getDocs(teamQuery);
                  if (!teamSnapshot.empty) {
                    const teamData = teamSnapshot.docs[0].data();
                    if (teamData.manager && teamData.manager.trim() !== '') {
                      managerId = teamData.manager;
                      console.log(`Found manager in team data: ${managerId} for employee ${appraisal.employeeId}`);
                    }
                  }
                } catch (teamError) {
                  console.error('Error getting team data:', teamError);
                }
              }
            }

            // Only update if we found a different manager
            if (managerId !== appraisal.managerId) {
              await AppraisalService.updateAppraisal(appraisal.id, { managerId });
              fixed++;
              console.log(`Fixed appraisal ${appraisal.id}: ${appraisal.employeeId} → manager ${managerId}`);
            }
          } catch (error) {
            console.error(`Error fixing appraisal ${appraisal.id}:`, error);
            errors++;
          }
        }
      }

      setResult({ fixed, errors });
      onComplete();
    } catch (error) {
      console.error('Error fixing appraisals:', error);
      alert('Failed to fix appraisals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
      >
        <Wrench className="h-4 w-4" />
        Fix Missing Managers
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Fix Missing Managers
              </h3>
              
              {!result ? (
                <>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    This will scan all appraisals and automatically assign managers to those that are missing one.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">How it works</p>
                        <p className="text-xs text-blue-700 mt-1">
                          The system will look up each employee's manager from the team data and update the appraisal accordingly.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3 mb-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-green-900">{result.fixed}</p>
                    <p className="text-sm text-green-700">Appraisals Fixed</p>
                  </div>
                  {result.errors > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="text-lg font-semibold text-red-900">{result.errors}</p>
                      <p className="text-sm text-red-700">Errors</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-lg">
              {!result ? (
                <>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={fixAppraisals}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    <Wrench className="h-4 w-4" />
                    {loading ? 'Fixing...' : 'Fix Now'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowModal(false);
                    setResult(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
