import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi, CollegeEvent } from '../../services/publicApi';
import { Calendar, MapPin, Clock, Tag, CalendarDays } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['publicEvents'],
    queryFn: () => publicApi.getEvents(),
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-14 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Academic Calendar
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              College Events &amp; Key Dates
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Official academic dates, matriculation ceremonies, orientation weeks, seminars, and deadlines at KICTAM College.
            </p>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-white rounded-xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-6">
            {events.map((event: CollegeEvent) => {
              const eventDate = new Date(event.startDate);
              const isPast = eventDate.getTime() < Date.now();

              return (
                <div
                  key={event.id}
                  className={`bg-white rounded-xl border border-[#E1E6ED] p-6 shadow-sm flex flex-col sm:flex-row items-start gap-6 ${
                    isPast ? 'opacity-80' : ''
                  }`}
                >
                  {/* Date Badge */}
                  <div className="w-16 h-16 bg-[#142D4E] text-white rounded-xl flex flex-col items-center justify-center shrink-0 border border-[#2b4c77]">
                    <span className="text-xs font-bold uppercase text-[#C69A43]">
                      {eventDate.toLocaleString('en-GB', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-black leading-none">
                      {eventDate.getDate()}
                    </span>
                    <span className="text-[10px] text-slate-300">{eventDate.getFullYear()}</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                        {event.category}
                      </span>
                      {isPast && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          Past Event
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-[#142D4E]">
                      {event.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
                      {event.description}
                    </p>

                    <div className="pt-2 text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C69A43]" />
                        <span>Venue: {event.venue}</span>
                      </div>
                      {event.timeString && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#C69A43]" />
                          <span>Time: {event.timeString}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E1E6ED] space-y-2">
            <CalendarDays className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No scheduled events</h3>
            <p className="text-xs text-slate-500">
              Future college events will be published here upon schedule approval.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
