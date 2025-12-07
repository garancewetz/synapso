'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';

export default function NotificationManager() {
  const { currentUser } = useUser();
  const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour vérifier et afficher la notification
  const checkAndShowNotification = useCallback(async () => {
    if (!currentUser) return;

    // Vérifier si la notification a déjà été affichée aujourd'hui
    const today = new Date().toDateString();
    const lastNotificationDate = localStorage.getItem('lastNotificationDate');
    if (lastNotificationDate === today) {
      return;
    }

    try {
      // Vérifier si l'utilisateur a complété des exercices aujourd'hui
      const response = await fetch(`/api/notifications/check?userId=${currentUser.id}`);
      const data = await response.json();

      // Si l'utilisateur n'a pas complété d'exercices aujourd'hui, afficher la notification
      if (!data.hasCompletedToday) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: 'Pensez à faire vos exercices !',
            options: {
              body: 'Vous n\'avez pas encore validé d\'exercice aujourd\'hui.',
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: 'daily-reminder',
              requireInteraction: false,
            },
          });
          // Enregistrer la date de la notification
          localStorage.setItem('lastNotificationDate', today);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des exercices:', error);
    }
  }, [currentUser]);

  // Demander la permission de notification et programmer les notifications
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (!currentUser) return;

    // Fonction pour programmer la notification quotidienne à 17h
    const scheduleDailyNotification = () => {
      // Nettoyer l'intervalle précédent s'il existe
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }

      const checkTime = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Si on est à 17h, vérifier et afficher la notification
        if (currentHour === 17 && currentMinute === 0) {
          checkAndShowNotification();
        }
      };

      // Vérifier immédiatement si on est à 17h
      checkTime();

      // Vérifier toutes les minutes
      notificationIntervalRef.current = setInterval(checkTime, 60000);
    };

    // Demander la permission si elle n'a pas encore été demandée
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          scheduleDailyNotification();
        }
      });
    } else if (Notification.permission === 'granted') {
      scheduleDailyNotification();
    }

    // Nettoyer l'intervalle au démontage
    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, [currentUser, checkAndShowNotification]);

  return null;
}

