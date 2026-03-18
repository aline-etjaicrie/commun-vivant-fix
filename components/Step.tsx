'use client';

import { useState } from 'react';
import { Step as StepType, Question as QuestionType } from '@/lib/schema';
import Question from './Question';
import StylePicker from './StylePicker';
import AlertModal from './AlertModal';

interface StepProps {
  step: StepType;
  data: any;
  onChange: (field: string, value: any) => void;
}

export default function Step({ step, data, onChange }: StepProps) {
  const [showInconnuAlert, setShowInconnuAlert] = useState(false);

  // Récupérer les infos pour personnalisation
  const prenom = data.identite?.prenom || 'cette personne';
  const pronom = data.identite?.pronom;
  const lienType = data.lienPersonne?.type;
  const modeContributeur = data.modeContributeur?.mode;
  const isSolo = modeContributeur?.includes('seul·e');
  const isMulti = modeContributeur?.includes('autres personnes');

  // Fonction pour obtenir le possessif selon le lien
  const getPossessif = () => {
    if (!lienType) return prenom || 'cette personne';
    
    if (lienType.includes('Père')) return 'votre père';
    if (lienType.includes('Mère')) return 'votre mère';
    if (lienType.includes('Fils')) return 'votre fils';
    if (lienType.includes('Fille')) return 'votre fille';
    if (lienType.includes('Frère')) return 'votre frère';
    if (lienType.includes('Sœur')) return 'votre sœur';
    if (lienType.includes('Conjoint')) return 'votre conjoint·e';
    if (lienType.includes('Conjointe')) return 'votre conjointe';
    if (lienType.includes('Partenaire')) return 'votre partenaire';
    if (lienType.includes('Parent')) return 'votre parent';
    if (lienType.includes('Enfant')) return 'votre enfant';
    if (lienType.includes('Fratrie')) return 'cette personne';
    if (lienType.includes('Ami')) return isMulti ? 'cette personne' : 'votre ami·e';
    if (lienType.includes('Amie')) return isMulti ? 'cette personne' : 'votre amie';
    if (lienType.includes('Collègue')) return 'cette personne';
    if (lienType.includes('Associé')) return 'cette personne';
    if (lienType.includes('connu personnellement')) return 'cette personne';
    
    return prenom || 'cette personne';
  };

  const getValueAtPath = (source: any, path: string) => {
    return path.split('.').reduce((acc, key) => {
      if (acc == null) return undefined;
      return acc[key];
    }, source);
  };

  const getQuestionField = (question: QuestionType) => question.path || `${step.id}.${question.id}`;

  // Fonction pour adapter le titre et la description
  const getAdaptedTitleAndDescription = () => {
    if (step.preserveDescription) {
      return {
        title: step.title,
        description: step.description,
      };
    }

    const possessif = getPossessif();
    
    let title = step.title;
    let description = step.description;

    // Adapter selon l'étape
    if (step.id === 'caractere') {
      title = `Caractère et tempérament`;
      if (isMulti) {
        description = `Comment était ${possessif} ? Quels mots correspondent le mieux ?`;
      } else if (lienType?.includes('connu personnellement')) {
        description = `Comment décririez-vous cette personne ?`;
      } else if (!possessif || possessif === 'cette personne') {
        description = `Décrivez cette personne. Quels mots lui correspondent le mieux ?`;
      } else {
        description = `Parlez-nous de ${possessif}. Quels mots lui correspondent le mieux ?`;
      }
    }

    if (step.id === 'valeurs') {
      title = `Valeurs`;
      if (lienType?.includes('connu personnellement')) {
        description = `Quelles valeurs semblaient importantes pour cette personne ?`;
      } else {
        description = `Quelles valeurs tenaient à cœur à ${possessif} ?`;
      }
    }

    if (step.id === 'talents') {
      if (lienType?.includes('connu personnellement')) {
        description = `Ce qui animait cette personne, ce qu'elle maîtrisait`;
      } else {
        description = `Ce qui animait ${possessif}, ce qu'${pronom === 'Elle' ? 'elle' : 'il'} maîtrisait`;
      }
    }

    if (step.id === 'realisation') {
      if (lienType?.includes('connu personnellement')) {
        description = `Un accomplissement dont cette personne était fière`;
      } else {
        description = `Un accomplissement dont ${possessif} était ${pronom === 'Elle' ? 'fière' : 'fier'}`;
      }
    }

    if (step.id === 'gouts') {
      if (lienType?.includes('connu personnellement')) {
        description = `Les goûts et préférences de cette personne`;
      } else {
        description = `Les petites choses qui définissaient ${possessif}`;
      }
    }

    return { title, description };
  };

  // Fonction pour adapter les options de lien selon le pronom
  const getAdaptedQuestions = () => {
    if (step.id === 'lienPersonne') {
      let lienOptions: string[] = [];

      if (pronom === 'Il') {
        lienOptions = [
          'Père',
          'Fils',
          'Frère',
          'Conjoint / Partenaire',
          'Ami',
          'Collègue / Associé',
          'Autre',
          'Je ne l\'ai pas connu personnellement'
        ];
      } else if (pronom === 'Elle') {
        lienOptions = [
          'Mère',
          'Fille',
          'Sœur',
          'Conjointe / Partenaire',
          'Amie',
          'Collègue / Associée',
          'Autre',
          'Je ne l\'ai pas connu personnellement'
        ];
      } else {
        lienOptions = [
          'Parent',
          'Enfant',
          'Fratrie',
          'Partenaire',
          'Ami·e',
          'Collègue / Associé·e',
          'Autre',
          'Je ne l\'ai pas connu personnellement'
        ];
      }

      return step.questions?.map((q) => {
        if (q.id === 'type') {
          return { ...q, options: lienOptions };
        }
        return q;
      });
    }

    // Pour l'étape mode contributeur, masquer les questions selon le mode
    if (step.id === 'modeContributeur') {
      return step.questions?.filter((q) => {
        if (q.id === 'mode') return true;
        if (isSolo && (q.id === 'quiContribue' || q.id === 'quiContribueLibre')) {
          return false;
        }
        return true;
      });
    }

    return step.questions;
  };

  const adaptedQuestions = getAdaptedQuestions();
  const { title, description } = getAdaptedTitleAndDescription();

  // Gérer le changement avec détection de "Je ne l'ai pas connu"
  const handleQuestionChange = (field: string, value: any) => {
    if (step.id === 'lienPersonne' && field === 'lienPersonne.type') {
      if (value?.includes('Je ne l\'ai pas connu')) {
        setShowInconnuAlert(true);
      }
    }
    onChange(field, value);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <AlertModal
        isOpen={showInconnuAlert}
        onClose={() => setShowInconnuAlert(false)}
        type="inconnu"
      />

      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-memoir-dark mb-3">
          {title}
        </h2>
        {description && (
          <p className="text-memoir-dark/70 text-lg">{description}</p>
        )}
      </div>

      {step.type === 'style-picker' ? (
        <StylePicker
          value={data.style}
          onChange={(value) => onChange('style', value)}
        />
      ) : (
        <div className="space-y-6">
          {adaptedQuestions?.map((question) => (
            (() => {
              const preferredField = getQuestionField(question);
              const legacyField = `${step.id}.${question.id}`;
              const value =
                getValueAtPath(data, preferredField) ??
                getValueAtPath(data, legacyField);

              return (
                <Question
                  key={question.id}
                  question={question}
                  value={value}
                  onChange={(nextValue) =>
                    handleQuestionChange(preferredField, nextValue)
                  }
                />
              );
            })()
          ))}
        </div>
      )}
    </div>
  );
}
