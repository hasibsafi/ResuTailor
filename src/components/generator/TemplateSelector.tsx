"use client";

import { TEMPLATES, TemplateSlug } from "@/types/resume";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Check } from "lucide-react";

interface TemplateSelectorProps {
  selected: TemplateSlug;
  onSelect: (slug: TemplateSlug) => void;
}

export default function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {TEMPLATES.map((template) => {
        const isSelected = selected === template.slug;
        const cardClass = isSelected
          ? "cursor-pointer transition-all ring-2 ring-blue-500 border-blue-500"
          : "cursor-pointer transition-all hover:border-gray-400";
        
        return (
          <Card
            key={template.slug}
            onClick={() => onSelect(template.slug)}
            className={cardClass}
          >
            <CardHeader className="p-4">
              <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md mb-2 flex items-center justify-center relative">
                <FileText className="h-10 w-10 text-gray-400" />
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <CardTitle className="text-sm">{template.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
