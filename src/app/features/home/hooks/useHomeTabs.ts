import { useState, useMemo, useEffect } from 'react';

type TabValue = 'exercices' | 'pinned' | 'suivi';

type TabOptionData = {
  value: TabValue;
  label: string;
  iconName: 'UserIcon' | 'BookmarkIcon' | 'RocketIcon';
};

export function useHomeTabs(pinnedCount: number, initialTabFromUrl?: TabValue | null) {
  const [activeTab, setActiveTab] = useState<TabValue>(initialTabFromUrl ?? 'exercices');

  useEffect(() => {
    if (initialTabFromUrl) {
      setActiveTab(initialTabFromUrl);
    }
  }, [initialTabFromUrl]);

  const tabOptionsData = useMemo<TabOptionData[]>(() => {
    const options: TabOptionData[] = [];

    options.push({
      value: 'exercices',
      label: 'Exercices',
      iconName: 'UserIcon',
    });

    options.push({
      value: 'pinned',
      label: pinnedCount > 0 ? `Épinglé (${pinnedCount})` : 'Épinglé',
      iconName: 'BookmarkIcon',
    });

    options.push({
      value: 'suivi',
      label: 'Suivi',
      iconName: 'RocketIcon',
    });

    return options;
  }, [pinnedCount]);

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
