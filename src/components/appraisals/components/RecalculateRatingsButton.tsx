import React, { useState } from 'react';
import { Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { AppraisalService } from '../../../services/appraisalService';

interface RecalculateRatingsButtonProps {
  onComplete: () => void;
}

export function RecalculateRatingsButton({ onComplete }: RecalculateRatingsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{ calculated: number; errors: number } | null>(null);

  const recalculateRatings = async () => {
    try {
      setLoading(true);
      const appraisals = await AppraisalService.getAppraisals();
      
      let calculated = 0;
      let errors = 0;

      for (const appraisal of appraisals) {
        // Only recalculate for appraisals that have at least one review
        if (appraisal.selfReview || appraisal.managerReview || appraisal.hrReview) {
          try {
            const rating = await AppraisalService.recalculateOverallRating(appraisal.id);
            calculated++;
            console.log(`Recalculated rating for appraisal ${appraisal.id}: ${rating.toFixed(2)}`);
          } catch (error) {
            console.error(`Error recalculating rating for appraisal ${appraisal.id}:`, error);
            errors++;
          }
        }
      }

      setResult({ calculated, errors });
      onComplete();
    } catch (error) {
      console.error('Error recalculating ratings:', error);
      alert('Failed to recalculate ratings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <Calculator className="h-4 w-4" />
        Recalculate Ratings
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Recalculate Overall Ratings
              </h3>
              
              {!result ? (
                <>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    This will recalculate the overall rating for all appraisals that have submitted reviews.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">How it works</p>
                        <p className="text-xs text-blue-700 mt-1">
                          The system will calculate the average of all rating questions from the submitted reviews (self, manager, and HR).
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3 mb-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-green-900">{result.calculated}</p>
                    <p className="text-sm text-green-700">Ratings Calculated</p>
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
                    onClick={recalculateRatings}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Calculator className="h-4 w-4" />
                    {loading ? 'Calculating...' : 'Calculate Now'}
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
