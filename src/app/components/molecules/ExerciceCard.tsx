'use client';

import { useState } from "react";
import Tag from "../atoms/Tag";
import Alert from "../atoms/Alert";
import { getBgColor, getBgColorLight } from "@/app/utils/colors";

interface ExerciceCardProps {
    id: number;
    exercice: any;
    onEdit?: (id: number) => void;
    onCompleted?: () => void;
    bodypartSection: any;
}

export default function ExerciceCard({ id, exercice, onEdit, onCompleted, bodypartSection }: ExerciceCardProps) {
    const [isCompleting, setIsCompleting] = useState(false);

    const handleEdit = () => {
        if (onEdit) {
            onEdit(id);
        }
    };

    const handleComplete = async () => {
        setIsCompleting(true);
        try {
            const response = await fetch(`/api/exercices/${id}/complete`, {
                method: 'PATCH',
            });

            if (response.ok) {
                if (onCompleted) {
                    onCompleted();
                }
            } else {
                console.error('Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="overflow-hidden relative p-5 border border-gray-300 rounded-lg transition-shadow bg-white grid grid-rows-[auto_1fr_auto] gap-4 text-gray-900">
            
         
            {/* En haut : tags bodypart/equipment à gauche, boutons à droite */}
            <div className={`  z-10 flex items-start justify-between z-20`}
            >

                <div className="flex flex-wrap gap-2">
                    {exercice.bodyparts && exercice.bodyparts.length > 0 && exercice.bodyparts.map((bodypart: any, index: number) => (
                        <Tag key={index} color={bodypart.color} className=" transition-all">
                            {bodypart.name}
                        </Tag>
                    ))}

                </div>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={handleEdit}
                        className=" transition-colors cursor-pointer"
                        title="Modifier"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                onClick={handleComplete}
                disabled={isCompleting}
                className={`cursor-pointer w-8 h-8 flex justify-center items-center p-1 z-20 border rounded-md  ${exercice.completed ? ' text-white bg-emerald-500 border-emerald-500 scale-[1.3]': 'text-gray-800 '} hover:text-white hover:bg-emerald-500 hover:border-emerald-500 hover:scale-[1.3] duration-300`}
                title={exercice.completed ? 'Complété' : 'Marquer comme complété'}
            >
               <div className="text">{isCompleting ? '...' : exercice.completed ? '✓' : '✓'}</div>
            </button>
     


                </div>
            </div>

            {/* Au milieu : titre, description et alertes - centré verticalement */}
            <div className={`  relative z-10 flex flex-col mt-4`}>
                <h2 className="text-xl font-bold  transition-colors">{exercice.name} {exercice.completed ? '✓' : ''}</h2>
                <p className=" my-3 transition-colors">{exercice.description.text}</p>
                {exercice.description.comment && <Alert className="peer-hover:bg-transparent  transition-all">{exercice.description.comment}</Alert>}

            </div>

            {/* En bas : tags workout et équipement */}
            <div className={` relative z-10 flex flex-wrap gap-2`}>
                {exercice.equipments && exercice.equipments.length > 0 &&
                    exercice.equipments.map((equipment: string, index: number) => (
                        <Tag key={index} className="peer-hover:bg-transparent  transition-all">
                            {equipment}
                        </Tag>
                    ))
                }
                {exercice.workout.series && exercice.workout.series > 1 && <Tag className="peer-hover:bg-transparent peer-hover:text-white  transition-all">Séries: {exercice.workout.series}</Tag>}
                {exercice.workout.repeat && <Tag className="peer-hover:bg-transparent  transition-all">Répétitions: {exercice.workout.repeat}x</Tag>}
                {exercice.workout.duration && <Tag className="peer-hover:bg-transparent  transition-all">{exercice.workout.duration}</Tag>}
            </div>
        </div>
    );
}
