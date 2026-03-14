"use client";

import { useState } from "react";
import { Building2, MapPin, Search, ChevronRight, School as SchoolIcon } from "lucide-react";
import Link from "next/link";

// Need to match the return type from getApprovedSchools
interface ApprovedSchool {
  userId: string;
  userEmail: string;
  firstName: string | null;
  lastName: string | null;
  schoolId: string;
  schoolName: string;
  schoolType: string;
  logoUrl: string | null;
  primaryColor: string | null;
  ownerName: string;
  ownerEmail: string;
  createdAt: Date;
  country: string | null;
  state: string | null;
  lga: string | null;
}

export function ApprovedSchoolsList({ schools }: { schools: ApprovedSchool[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSchools = schools.filter(
    (s) =>
      s.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by school, owner, or email..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 py-2 w-full rounded-md bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>

      {filteredSchools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl bg-surface/50">
          <SchoolIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-primary-text">
            No schools found
          </h3>
          <p className="text-sm text-secondary-text mt-1">
            {searchTerm ? "Try a different search term." : "No approved schools are currently on the platform."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSchools.map((school) => (
            <Link
              key={school.schoolId}
              href={`/org/schools/${school.schoolId}`}
              className="group flex flex-col bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-brand/30"
            >
              <div 
                className="h-20 w-full relative"
                style={{ backgroundColor: school.primaryColor || "#3b82f6" }}
              >
                <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-surface to-transparent" />
              </div>

              <div className="p-5 pt-0 flex-1 flex flex-col relative">
                <div 
                  className="h-16 w-16 -mt-8 rounded-xl ring-4 ring-surface flex items-center justify-center text-xl font-bold text-white shadow-sm mb-3 shrink-0"
                  style={{ backgroundColor: school.primaryColor || "#3b82f6" }}
                >
                  {school.schoolName.charAt(0)}
                </div>
                
                <h3 className="font-bold text-lg text-primary-text leading-tight group-hover:text-brand transition-colors line-clamp-2">
                  {school.schoolName}
                </h3>
                
                <div className="flex items-center gap-1.5 mt-2 text-xs text-secondary-text">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{school.schoolType}</span>
                </div>
                
                {school.state && school.country && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-secondary-text">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{school.state}, {school.country}</span>
                  </div>
                )}
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Registered</span>
                    <span className="text-xs font-medium text-primary-text">{new Date(school.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
