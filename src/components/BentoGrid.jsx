import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function BentoGrid({ items }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {items.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    onClick={item.onClick}
                    className={cn(
                        'group relative rounded-xl overflow-hidden transition-all duration-300',
                        'border border-white/[0.08] bg-[var(--bg-card)]',
                        'hover:shadow-[0_4px_24px_rgba(124,111,247,0.08)]',
                        'hover:-translate-y-0.5 will-change-transform',
                        'hover:border-white/[0.14]',
                        item.colSpan === 2 ? 'md:col-span-2' : 'col-span-1',
                        item.onClick && 'cursor-pointer',
                        {
                            'shadow-[0_2px_16px_rgba(124,111,247,0.06)] -translate-y-0.5 border-white/[0.12]':
                                item.hasPersistentHover,
                        }
                    )}
                >
                    {/* Dot-pattern overlay on hover */}
                    <div
                        className={`absolute inset-0 ${item.hasPersistentHover
                                ? 'opacity-100'
                                : 'opacity-0 group-hover:opacity-100'
                            } transition-opacity duration-300`}
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[length:4px_4px]" />
                    </div>

                    {/* Inner content */}
                    <div className="relative flex flex-col space-y-3 p-5">
                        {/* Top row: icon + status badge */}
                        <div className="flex items-center justify-between">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.06] group-hover:bg-white/[0.10] transition-all duration-300 text-lg">
                                {item.icon}
                            </div>
                            {item.status && (
                                <span
                                    className={cn(
                                        'text-[11px] font-semibold px-2.5 py-1 rounded-lg',
                                        'bg-white/[0.06] text-[var(--text-secondary)]',
                                        'transition-colors duration-300 group-hover:bg-white/[0.10]',
                                        item.statusColor && `text-[${item.statusColor}]`
                                    )}
                                >
                                    {item.status}
                                </span>
                            )}
                        </div>

                        {/* Title + meta + description */}
                        <div className="space-y-1.5">
                            <h3 className="font-semibold text-[var(--text-primary)] tracking-tight text-[15px] leading-snug">
                                {item.title}
                                {item.meta && (
                                    <span className="ml-2 text-xs text-[var(--text-secondary)] font-normal">
                                        {item.meta}
                                    </span>
                                )}
                            </h3>
                            <div className="text-sm text-[var(--text-secondary)] leading-snug font-normal">
                                {item.description}
                            </div>
                        </div>

                        {/* Bottom row: tags + CTA */}
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                                {item.tags?.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 rounded-md bg-white/[0.06] transition-all duration-200 hover:bg-white/[0.10]"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            {item.cta && (
                                <span className="text-xs text-[var(--accent)] font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                                    {item.cta}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Gradient border glow */}
                    <div
                        className={`absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-white/[0.05] to-transparent ${item.hasPersistentHover
                                ? 'opacity-100'
                                : 'opacity-0 group-hover:opacity-100'
                            } transition-opacity duration-300`}
                    />
                </motion.div>
            ))}
        </div>
    );
}

export { BentoGrid };
