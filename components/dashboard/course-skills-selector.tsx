"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus, Loader2, Search, Target } from "lucide-react";
import {
  getCourseSkills,
  addSkillToCourse,
  removeSkillFromCourse,
} from "@/actions/skills/course-skills";
import { getSkillsList } from "@/actions/skills/admin";
import toast from "react-hot-toast";

const MAX_SKILLS = 5;

interface CourseSkillsSelectorProps {
  courseId: string;
  maxSkills?: number;
}

interface SkillItem {
  id: string;
  title: string;
  category: string;
}

export function CourseSkillsSelector({
  courseId,
  maxSkills = MAX_SKILLS,
}: CourseSkillsSelectorProps) {
  const [linkedSkills, setLinkedSkills] = useState<SkillItem[]>([]);
  const [allSkills, setAllSkills] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [courseRes, skillsRes] = await Promise.all([
      getCourseSkills(courseId),
      getSkillsList(),
    ]);
    if ("skills" in courseRes) {
      const seen = new Set<string>();
      setLinkedSkills(
        courseRes.skills.filter((s) => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        }),
      );
    }
    if ("skills" in skillsRes) setAllSkills(skillsRes.skills);
    setIsLoading(false);
  }, [courseId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const isAtLimit = linkedSkills.length >= maxSkills;

  const handleAdd = async (skillId: string) => {
    if (isAtLimit) {
      toast.error(`Maximum of ${maxSkills} linked skills allowed`);
      return;
    }
    setAddingId(skillId);
    const res = await addSkillToCourse(courseId, skillId);
    setAddingId(null);
    if ("error" in res) {
      toast.error(res.error || "Failed to add skill");
      return;
    }
    const skill = allSkills.find((s) => s.id === skillId);
    if (skill)
      setLinkedSkills((prev) =>
        prev.some((s) => s.id === skillId) ? prev : [...prev, skill],
      );
  };

  const handleRemove = async (skillId: string) => {
    setRemovingId(skillId);
    const res = await removeSkillFromCourse(courseId, skillId);
    setRemovingId(null);
    if ("error" in res) {
      toast.error(res.error || "Failed to remove skill");
      return;
    }
    setLinkedSkills((prev) => prev.filter((s) => s.id !== skillId));
  };

  const linkedIds = new Set(linkedSkills.map((s) => s.id));
  const availableSkills = allSkills.filter(
    (s) =>
      !linkedIds.has(s.id) &&
      (searchQuery === "" ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Group available skills by category
  const grouped = availableSkills.reduce<Record<string, SkillItem[]>>(
    (acc, skill) => {
      const cat = skill.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    },
    {},
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-secondary-text py-3">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading skills...
      </div>
    );
  }

  return (
    <div>
      {/* Linked Skills */}
      {linkedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {linkedSkills.map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 text-brand rounded-full text-xs font-medium"
            >
              <Target className="w-3 h-3" />
              {skill.title}
              <button
                type="button"
                onClick={() => handleRemove(skill.id)}
                disabled={removingId === skill.id}
                className="ml-0.5 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {removingId === skill.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <X className="w-3 h-3" />
                )}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add Skills Button / Picker */}
      {!showPicker ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            disabled={isAtLimit}
            className="inline-flex items-center gap-1.5 text-xs text-brand hover:text-brand/80 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            {linkedSkills.length === 0
              ? "Link skills to this course"
              : isAtLimit
                ? `Max ${maxSkills} skills reached`
                : "Add more skills"}
          </button>
          {linkedSkills.length > 0 && (
            <span className="text-[10px] text-secondary-text">
              {linkedSkills.length}/{maxSkills}
            </span>
          )}
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-surface">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="w-4 h-4 text-secondary-text" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="flex-1 text-sm bg-transparent text-primary-text placeholder:text-secondary-text focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setShowPicker(false);
                setSearchQuery("");
              }}
              className="p-1 hover:bg-surface-muted rounded-md"
            >
              <X className="w-4 h-4 text-secondary-text" />
            </button>
          </div>

          {/* Skill List */}
          <div className="max-h-48 overflow-y-auto">
            {Object.keys(grouped).length === 0 ? (
              <p className="text-xs text-secondary-text text-center py-4">
                {allSkills.length === 0
                  ? "No skills created yet"
                  : "No matching skills found"}
              </p>
            ) : (
              Object.entries(grouped)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, catSkills]) => (
                  <div key={category}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-secondary-text uppercase tracking-wider bg-surface-muted">
                      {category}
                    </div>
                    {catSkills.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => handleAdd(skill.id)}
                        disabled={addingId === skill.id}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-primary-text hover:bg-brand/5 transition-colors disabled:opacity-50"
                      >
                        <span>{skill.title}</span>
                        {addingId === skill.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-secondary-text" />
                        )}
                      </button>
                    ))}
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
