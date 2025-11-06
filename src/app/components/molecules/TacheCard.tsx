'use client';

import { useState } from "react";
import Tag from "../atoms/Tag";

interface TacheCardProps {
    id: number;
    tache: {
        title: string;
        url: string;
        identifier: string;
        password: string;
        isMonthly: boolean;
    };
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
}

export default function TacheCard({ id, tache, onEdit, onDelete }: TacheCardProps) {
    const [copiedField, setCopiedField] = useState<'identifier' | 'password' | null>(null);

    const copyToClipboard = async (text: string, field: 'identifier' | 'password') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <div className="overflow-hidden relative p-3 border border-gray-200 rounded-lg transition-all bg-white hover:shadow-lg shadow-sm hover:border-gray-300 text-gray-900 min-h-[80px]">
            <div className="flex flex-col gap-3 h-full">
                {/* Titre et tag */}
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-bold">{tache.title}</h2>
                    <div className="flex items-center gap-2">
                        {tache.isMonthly && (
                            <Tag color="blue" className="text-xs">
                                À faire tous les mois
                            </Tag>
                        )}
                        {onEdit && (
                            <button
                                onClick={() => onEdit(id)}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Modifier"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(id)}
                                className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Lien vers le site */}
                <div>
                    <a
                        href={tache.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Accéder au site
                    </a>
                </div>

                {/* Identifiant avec copie */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">Identifiant:</span>
                    <span className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded flex-1">{tache.identifier}</span>
                    <button
                        onClick={() => copyToClipboard(tache.identifier, 'identifier')}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copier l'identifiant"
                    >
                        {copiedField === 'identifier' ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mot de passe avec copie */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">Mot de passe:</span>
                    <span className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded flex-1">{tache.password}</span>
                    <button
                        onClick={() => copyToClipboard(tache.password, 'password')}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copier le mot de passe"
                    >
                        {copiedField === 'password' ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

