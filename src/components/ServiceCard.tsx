interface ServiceCardProps {
  title: string;
  description: string;
}

export default function ServiceCard({ title, description }: ServiceCardProps) {
  return (
    <div className="group glass-effect rounded-2xl p-8 border border-[rgba(244,204,126,0.30)] hover:border-[rgb(244,204,126)] transition-all duration-300 hover:shadow-2xl hover:shadow-[rgba(244,204,126,0.20)] hover:-translate-y-2">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[rgb(244,204,126)] to-[rgb(244,204,126)] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[rgb(244,204,126)] transition-colors">{title}</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
