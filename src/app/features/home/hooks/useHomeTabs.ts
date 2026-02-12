import { useState, useMemo } from 'react';

type TabValue = 'exercices' | 'journal' | 'progression';

type TabOptionData = {
  value: TabValue;
  label: string;
  iconName: 'UserIcon' | 'BookIcon' | 'RocketIcon';
};

export function useHomeTabs(hasJournal: boolean) {
  const [activeTab, setActiveTab] = useState<TabValue>('exercices');

  const tabOptionsData = useMemo<TabOptionData[]>(() => {
    const options: TabOptionData[] = [];
    
    options.push({ 
      value: 'exercices', 
      label: 'Exercices',
      iconName: 'UserIcon',
    });
    
    if (hasJournal) {
      options.push({ 
        value: 'journal', 
        label: 'Journal',
        iconName: 'BookIcon',
      });
    }
    
    options.push({ 
      value: 'progression', 
      label: 'Progression',
      iconName: 'RocketIcon',
    });
    
    return options;
  }, [hasJournal]);

  const currentActiveTab = useMemo(() => {
    const isTabAvailable = tabOptionsData.some(opt => opt.value === activeTab);
    return isTabAvailable ? activeTab : 'exercices';
  }, [activeTab, tabOptionsData]);

  return {
    activeTab: currentActiveTab,
    setActiveTab,
    tabOptionsData,
  };
}
