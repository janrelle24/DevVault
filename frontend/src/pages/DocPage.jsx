//import { useEffect, useState } from 'react';
//import { useParams } from 'react-router-dom';
import { Link2, Bookmark, BookmarkCheck, Clock } from 'lucide-react';
import { Breadcrumbs, TagBadge } from '../components/Bits';
import CodeBlock from '../components/CodeBlock';
import RightRail from '../components/RightRail';

export default function DocPage(){
    return (
        <div className="flex">
            <div className="flex-1 min-w-0 px-6 lg:px-10 py-8 max-w-3xl">
                <Breadcrumbs
                items={[
                    
                ]}
                />
        
                <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-3xl"></span>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight"></h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                    
                    className="flex items-center gap-1.5 rounded-lg border border-vault-border bg-vault-elevated px-3 py-2 text-xs font-medium text-vault-muted hover:text-white transition-colors"
                    >
                    <Link2 size={14} />
                    </button>
                    <button
                    
                    
                    
                        
                        
                    
                    >
                    <BookmarkCheck size={14} /> : <Bookmark size={14} />
                    
                    </button>
                </div>
                </div>
        
                
                <p className="text-vault-muted leading-relaxed mb-4"></p>
                
        
                <div className="flex items-center gap-2 flex-wrap mb-8">
                
                    <TagBadge />
                
                <span className="inline-flex items-center gap-1.5 text-xs text-vault-faint">
                    <Clock size={12} />
                </span>
                </div>
        
                <hr className="border-vault-border mb-8" />
        
                <div className="space-y-10">
                
                    <section  className="scroll-mt-24">
                    
                        <h2 className="text-xl font-bold text-white mb-2"></h2>
                
                    
                        <p className="text-vault-muted leading-relaxed mb-4"></p>
                    
                    
                        <CodeBlock  />
                        <div
                            className={`mt-4 rounded-lg border px-4 py-3 text-sm flex items-center gap-2 `}
                        >
                        
                            <span className="h-4 w-4 rounded-full bg-vault-success/20 flex items-center justify-center text-[10px]">
                            ✓
                            </span>
                        
                        
                        </div>
                    
                    </section>
                
                </div>
            </div>
        
            <RightRail />
        </div>
    );
}