-- Ajoute le statut 'refused' à la file de modération des contributions
ALTER TYPE memory_contribution_status ADD VALUE IF NOT EXISTS 'refused';
