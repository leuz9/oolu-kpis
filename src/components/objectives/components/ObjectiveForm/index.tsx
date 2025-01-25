// Ajouter après les imports existants
import ParentObjectiveSelect from './ParentObjectiveSelect';

// Modifier la fonction handleSubmit
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  // Validation du parent obligatoire pour les niveaux department et individual
  if (formData.level !== 'company' && !formData.parentId) {
    setError('Please select a parent objective');
    return;
  }

  // Validation des contributeurs
  if (formData.level !== 'company' && formData.contributors.length === 0) {
    setError('Please assign at least one user to this objective');
    return;
  }

  const objective = {
    ...formData,
    progress: 0,
    parentId: formData.parentId,
    departmentId: parentObjective?.departmentId || null,
    year: parseInt(formData.quarter.split('-')[0])
  };
  onSubmit(objective);
};

// Ajouter dans le JSX après le composant Classification
<ParentObjectiveSelect
  objectives={objectives}
  selectedObjectiveId={formData.parentId}
  level={formData.level}
  onChange={(objectiveId) => handleFieldChange('parentId', objectiveId)}
  loading={loadingObjectives}
  error={error && !formData.parentId ? 'Parent objective is required' : null}
/>