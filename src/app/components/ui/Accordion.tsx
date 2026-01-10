'use client';

import { createContext, use, useState, useCallback, type ReactNode } from 'react';
import clsx from 'clsx';
import { ChevronIcon } from '@/app/components/ui/icons';

// ============================================================================
// TYPES
// ============================================================================

type AccordionContextValue = {
  expandedItems: Set<string>;
  toggleItem: (value: string) => void;
  multiple?: boolean;
};

type AccordionProps = {
  children: ReactNode;
  /** Si true, plusieurs items peuvent être ouverts simultanément */
  multiple?: boolean;
  /** Items ouverts par défaut */
  defaultValue?: string | string[];
  className?: string;
};

type AccordionItemContextValue = {
  value: string;
  isExpanded: boolean;
};

type AccordionItemProps = {
  children: ReactNode;
  value: string;
  className?: string;
};

type AccordionTriggerProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  /** Si true, utilise une icône chevron par défaut */
  showChevron?: boolean;
};

type AccordionContentProps = {
  children: ReactNode;
  className?: string;
};

// ============================================================================
// CONTEXTS
// ============================================================================

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

// ============================================================================
// HOOKS
// ============================================================================

function useAccordion() {
  const context = use(AccordionContext);
  if (!context) {
    throw new Error('Accordion compound components must be used within Accordion');
  }
  return context;
}

function useAccordionItem() {
  const context = use(AccordionItemContext);
  if (!context) {
    throw new Error('Accordion.Trigger and Accordion.Content must be used within Accordion.Item');
  }
  return context;
}

// ============================================================================
// ACCORDION ROOT
// ============================================================================

/**
 * Composant Accordion avec compound pattern
 * Gère l'état d'expansion des items et fournit le contexte
 * 
 * @example
 * ```tsx
 * <Accordion>
 *   <Accordion.Item value="item-1">
 *     <Accordion.Trigger>Question 1</Accordion.Trigger>
 *     <Accordion.Content>Réponse 1</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion>
 * ```
 */
export function Accordion({ 
  children, 
  multiple = false, 
  defaultValue,
  className = '' 
}: AccordionProps) {
  // Initialiser les items ouverts
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    if (!defaultValue) return new Set();
    if (Array.isArray(defaultValue)) return new Set(defaultValue);
    return new Set([defaultValue]);
  });

  const toggleItem = useCallback((value: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      
      if (newSet.has(value)) {
        // Fermer l'item
        newSet.delete(value);
      } else {
        // Ouvrir l'item
        if (!multiple) {
          // Mode single : fermer tous les autres
          newSet.clear();
        }
        newSet.add(value);
      }
      
      return newSet;
    });
  }, [multiple]);

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem, multiple }}>
      <div className={clsx('space-y-2', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// ============================================================================
// ACCORDION ITEM
// ============================================================================

function AccordionItem({ children, value, className = '' }: AccordionItemProps) {
  const { expandedItems } = useAccordion();
  const isExpanded = expandedItems.has(value);

  return (
    <AccordionItemContext.Provider value={{ value, isExpanded }}>
      <div 
        className={clsx(
          'bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden',
          className
        )}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

// ============================================================================
// ACCORDION TRIGGER
// ============================================================================

function AccordionTrigger({ 
  children, 
  className = '',
  icon,
  showChevron = true 
}: AccordionTriggerProps) {
  const { toggleItem } = useAccordion();
  const { value, isExpanded } = useAccordionItem();

  return (
    <button
      onClick={() => toggleItem(value)}
      className={clsx(
        'w-full flex items-center justify-between gap-3 cursor-pointer',
        'p-4 sm:p-5',
        'hover:bg-gray-50 transition-colors',
        'text-left',
        'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset',
        className
      )}
      aria-expanded={isExpanded}
      aria-controls={`accordion-content-${value}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && (
          <span className="text-2xl shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
      
      {showChevron && (
        <ChevronIcon
          direction={isExpanded ? 'up' : 'down'}
          className="w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

// ============================================================================
// ACCORDION CONTENT
// ============================================================================

function AccordionContent({ children, className = '' }: AccordionContentProps) {
  const { value, isExpanded } = useAccordionItem();

  return (
    <div
      id={`accordion-content-${value}`}
      className={clsx(
        'overflow-hidden transition-all duration-300 ease-in-out',
        isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
      )}
      aria-hidden={!isExpanded}
    >
      <div className={clsx('p-4 sm:p-5 pt-0', className)}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

