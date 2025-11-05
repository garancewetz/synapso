'use client';
import Button from "../atoms/Button";
import HamburgerMenu from "../atoms/HamburgerMenu";
import { useState } from "react";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
 
export default function UpBar() {
    const [pendingAction, setPendingAction] = useState<'add' | 'edit' | null>(null);
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const pathname = usePathname()
    console.log(pathname)

    const buttonAddExercice = () => {
        return (
            <Link href="/exercice/add">
                <Button>
                    <span className="hidden sm:inline">Ajouter un exercice</span>
                    <span className="sm:hidden">+</span>
                </Button>
            </Link>
        )
    }

    const buttonAddAphasy = () => {
        return (
            <Link href="/aphasie/add">
                <Button>
                    <span className="hidden sm:inline">Ajouter une citation</span>
                </Button>
            </Link>
        )
    }

    const pathnameMap = {
        '/': {
            title: "Exercices",
            subtitle: null,
            button:  buttonAddExercice()
        },
        '/historique': {
            title: "Historique",
            subtitle: null,
            button:  buttonAddExercice()
        },
        '/exercice/add': {
            title: "Ajouter un exercice",
            subtitle: "Créez un nouvel exercice pour votre programme d'entraînement",
            button: null
        },
        '/aphasie': {
            title: "Aphasie",
            subtitle: null,
            button: buttonAddAphasy()
        },
        '/exercice/edit/': {
            title: "Modifier l'exercice",
            subtitle: null,
            button: buttonAddExercice()
        },
        '/aphasie/add': {
            title: "Ajouter une citation",
            subtitle: "Créez une nouvelle citation pour votre liste d'aphasie",
            button: null
        },
        '/aphasie/edit/': {
            title: "Modifier la citation",
            subtitle: null,
            button: buttonAddAphasy()
        },
      
    }

    const getUpbarInfos = () => {
        if (pathname.includes('exercice/edit')) {
            return pathnameMap['/exercice/edit/']
        } 
        if (pathname.includes('aphasie/edit')) {
            return pathnameMap['/aphasie/edit/']
        }
        return pathnameMap[pathname]
    }


    return (
        <div className="border-b border-gray-200">
            <div className="flex justify-between items-center p-3">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">{getUpbarInfos().title}</h1>
                </div>
                <div className="flex gap-2">
                    {getUpbarInfos().subtitle ? (
                        <p className="text-sm sm:text-base text-gray-600">{getUpbarInfos().subtitle}</p>
                    ) : ''}
                    {getUpbarInfos().button ? 
                        getUpbarInfos().button
                     : ''}
                </div>
            </div>
        </div>
    );
}