"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Plus, X, Code, Users } from "lucide-react";

interface MatchInsightsProps {
  matchedKeywords: string[];
  missingKeywords: string[];
  onAddKeyword?: (keyword: string) => void;
  onRemoveKeyword?: (keyword: string) => void;
  addedKeywords?: string[];
}

// Common soft skill keywords/patterns for categorization
const SOFT_SKILL_PATTERNS = [
  'communication', 'leadership', 'teamwork', 'problem-solving', 'problem solving',
  'collaboration', 'time management', 'adaptability', 'creativity', 'critical thinking',
  'interpersonal', 'organizational', 'presentation', 'negotiation', 'conflict resolution',
  'decision-making', 'decision making', 'emotional intelligence', 'empathy', 'flexibility',
  'motivation', 'self-motivated', 'self-starter', 'proactive', 'initiative', 'multitasking',
  'multi-tasking', 'attention to detail', 'detail-oriented', 'customer service', 'client',
  'stakeholder', 'cross-functional', 'mentoring', 'coaching', 'training', 'facilitation',
  'relationship building', 'strategic thinking', 'analytical', 'resourceful', 'reliable',
  'responsible', 'accountability', 'work ethic', 'positive attitude', 'team player',
  'verbal', 'written', 'listening', 'influence', 'persuasion', 'networking', 'cultural',
  'remote work', 'agile mindset', 'growth mindset', 'resilience', 'patience', 'integrity',
  'professional', 'enthusiasm', 'passionate', 'driven', 'results-oriented', 'goal-oriented'
];

function isSoftSkill(keyword: string): boolean {
  const lowerKeyword = keyword.toLowerCase();
  return SOFT_SKILL_PATTERNS.some(pattern => 
    lowerKeyword.includes(pattern) || pattern.includes(lowerKeyword)
  );
}

function categorizeKeywords(keywords: string[]): { technical: string[]; soft: string[] } {
  const technical: string[] = [];
  const soft: string[] = [];
  
  for (const keyword of keywords) {
    if (isSoftSkill(keyword)) {
      soft.push(keyword);
    } else {
      technical.push(keyword);
    }
  }
  
  return { technical, soft };
}

export default function MatchInsights({
  matchedKeywords,
  missingKeywords,
  onAddKeyword,
  onRemoveKeyword,
  addedKeywords = [],
}: MatchInsightsProps) {
  // Categorize matched and missing keywords
  const matchedCategorized = categorizeKeywords(matchedKeywords);
  const missingCategorized = categorizeKeywords(missingKeywords);
  
  // Total keywords is matched + missing (from the current state)
  const totalKeywords = matchedKeywords.length + missingKeywords.length;
  
  // Match rate based on current state
  const matchRate = totalKeywords > 0 
    ? Math.min((matchedKeywords.length / totalKeywords) * 100, 100)
    : 0;

  // If no keywords at all, show a message
  if (totalKeywords === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No keyword analysis available yet.</p>
          <p className="text-sm text-gray-500 mt-2">Generate a tailored resume to see keyword insights.</p>
        </div>
      </div>
    );
  }

  const renderKeywordBadge = (keyword: string, idx: number, isMatched: boolean) => {
    const isUserAdded = addedKeywords.includes(keyword);
    
    if (isMatched) {
      return (
        <Badge 
          key={idx} 
          variant="secondary" 
          className={`bg-green-100 text-green-800 ${
            isUserAdded 
              ? 'ring-2 ring-green-400 cursor-pointer hover:bg-red-100 hover:text-red-800 hover:ring-red-400 transition-colors pr-1' 
              : ''
          }`}
          onClick={() => isUserAdded && onRemoveKeyword?.(keyword)}
        >
          {keyword}
          {isUserAdded && onRemoveKeyword && (
            <X className="h-3 w-3 ml-1" />
          )}
        </Badge>
      );
    } else {
      return (
        <Badge 
          key={idx} 
          variant="secondary" 
          className={`bg-amber-100 text-amber-800 ${onAddKeyword ? 'cursor-pointer hover:bg-green-100 hover:text-green-800 transition-colors' : ''}`}
          onClick={() => onAddKeyword?.(keyword)}
        >
          {onAddKeyword && <Plus className="h-3 w-3 mr-1" />}
          {keyword}
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Match Score */}
      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
        <div className="text-5xl font-bold text-blue-600 mb-2">
          {Math.round(matchRate)}%
        </div>
        <p className="text-gray-600">Keyword Match Rate</p>
        {addedKeywords.length > 0 && (
          <p className="text-sm text-green-600 mt-1">
            +{addedKeywords.length} keywords added by you
          </p>
        )}
      </div>

      {/* Matched Keywords Section */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 font-semibold text-green-700">
          <CheckCircle className="h-4 w-4" />
          Matched Keywords ({matchedKeywords.length})
        </h4>
        
        {/* Matched Technical Keywords */}
        {matchedCategorized.technical.length > 0 && (
          <div className="pl-2 border-l-2 border-green-200">
            <h5 className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              <Code className="h-3 w-3" />
              Technical Skills ({matchedCategorized.technical.length})
            </h5>
            <div className="flex flex-wrap gap-2">
              {matchedCategorized.technical.map((keyword, idx) => 
                renderKeywordBadge(keyword, idx, true)
              )}
            </div>
          </div>
        )}
        
        {/* Matched Soft Skills */}
        {matchedCategorized.soft.length > 0 && (
          <div className="pl-2 border-l-2 border-green-200">
            <h5 className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              <Users className="h-3 w-3" />
              Soft Skills ({matchedCategorized.soft.length})
            </h5>
            <div className="flex flex-wrap gap-2">
              {matchedCategorized.soft.map((keyword, idx) => 
                renderKeywordBadge(keyword, idx, true)
              )}
            </div>
          </div>
        )}
        
        {matchedKeywords.length === 0 && (
          <p className="text-sm text-gray-500 pl-2">No matched keywords yet</p>
        )}
        
        {onRemoveKeyword && addedKeywords.length > 0 && (
          <p className="text-xs text-gray-500 pl-2">Click a keyword with an X to remove it</p>
        )}
      </div>

      {/* Missing Keywords Section */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 font-semibold text-amber-700">
          <XCircle className="h-4 w-4" />
          Missing Keywords ({missingKeywords.length})
        </h4>
        
        {/* Missing Technical Keywords */}
        {missingCategorized.technical.length > 0 && (
          <div className="pl-2 border-l-2 border-amber-200">
            <h5 className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              <Code className="h-3 w-3" />
              Technical Skills ({missingCategorized.technical.length})
            </h5>
            <div className="flex flex-wrap gap-2">
              {missingCategorized.technical.map((keyword, idx) => 
                renderKeywordBadge(keyword, idx, false)
              )}
            </div>
          </div>
        )}
        
        {/* Missing Soft Skills */}
        {missingCategorized.soft.length > 0 && (
          <div className="pl-2 border-l-2 border-amber-200">
            <h5 className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              <Users className="h-3 w-3" />
              Soft Skills ({missingCategorized.soft.length})
            </h5>
            <div className="flex flex-wrap gap-2">
              {missingCategorized.soft.map((keyword, idx) => 
                renderKeywordBadge(keyword, idx, false)
              )}
            </div>
          </div>
        )}
        
        {missingKeywords.length === 0 && (
          <p className="text-sm text-gray-500 pl-2">All keywords matched! 🎉</p>
        )}
        
        {onAddKeyword && missingKeywords.length > 0 && (
          <p className="text-xs text-gray-500 pl-2">Click a keyword to add it to your skills</p>
        )}
      </div>

      {/* Tips */}
      {missingKeywords.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click on missing keywords above to add them to your skills</li>
            <li>• Only add skills you genuinely have experience with</li>
            <li>• Focus on the most important missing keywords first</li>
            <li>• Technical skills are typically weighted more heavily by ATS systems</li>
          </ul>
        </div>
      )}
    </div>
  );
}
