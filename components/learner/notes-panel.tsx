"use client";

import { useEffect, useState, useRef } from "react";
import { Editor } from "@/components/editor";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useDebounce } from "@/hooks/use-debounce";
import { getUserNote, saveUserNote } from "@/actions/notes";
import { toast } from "react-hot-toast";
import { Loader2, Check } from "lucide-react";

interface NotesPanelProps {
  lessonId: string;
  tutorNotes?: string | null;
}

export function NotesPanel({ lessonId, tutorNotes }: NotesPanelProps) {
  const [activeTab, setActiveTab] = useState<"my-notes" | "tutor-notes">(
    "my-notes",
  );

  const [noteContent, setNoteContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Debounce content for auto-save (4 seconds)
  const debouncedContent = useDebounce(noteContent, 4000);
  const lastSavedContent = useRef("");
  const initialLoadDone = useRef(false);

  useEffect(() => {
    async function fetchNote() {
      try {
        const result = await getUserNote(lessonId);
        if (result.note) {
          setNoteContent(result.note.content || "");
          lastSavedContent.current = result.note.content || "";
        }
      } catch (error) {
        console.error("Failed to load note:", error);
      } finally {
        setIsLoading(false);
        initialLoadDone.current = true;
      }
    }
    fetchNote();
  }, [lessonId]);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (debouncedContent === lastSavedContent.current) return;

    async function save() {
      setIsSaving(true);
      try {
        const result = await saveUserNote(lessonId, debouncedContent);
        if (result.error) {
          toast.error("Failed to save note");
        } else {
          lastSavedContent.current = debouncedContent;
        }
      } catch (error) {
        console.error("Failed to save note:", error);
        toast.error("Failed to save note");
      } finally {
        setIsSaving(false);
      }
    }

    save();
  }, [debouncedContent, lessonId]);

  // Tutor Notes Read-Only Editor
  const tutorEditor = useEditor({
    immediatelyRender: false,
    editable: false,
    content: tutorNotes || "<p>No notes from tutor.</p>",
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-brand underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class:
            "rounded-xl border border-border mt-4 mb-4 max-h-[400px] object-contain bg-black/20",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none text-sm",
      },
    },
  });

  // Update tutor editor content if prop changes
  useEffect(() => {
    if (tutorEditor && tutorNotes) {
      tutorEditor.commands.setContent(tutorNotes);
    }
  }, [tutorNotes, tutorEditor]);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col h-full max-h-[600px]">
      {/* Tabs Header */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("my-notes")}
          className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === "my-notes"
              ? "bg-surface text-brand border-b-2 border-brand"
              : "bg-surface-muted text-secondary-text hover:text-primary-text"
          }`}
        >
          My Notes
        </button>
        <button
          onClick={() => setActiveTab("tutor-notes")}
          className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === "tutor-notes"
              ? "bg-surface text-brand border-b-2 border-brand"
              : "bg-surface-muted text-secondary-text hover:text-primary-text"
          }`}
        >
          Tutor Notes
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === "my-notes" && (
          <div className="h-full flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-end mb-2 h-6">
                  {isSaving ? (
                    <span className="text-xs text-secondary-text flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                    </span>
                  ) : lastSavedContent.current ? (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Saved
                    </span>
                  ) : null}
                </div>
                <div className="flex-1">
                  <Editor value={noteContent} onChange={setNoteContent} />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "tutor-notes" && (
          <div className="prose dark:prose-invert max-w-none">
            <EditorContent editor={tutorEditor} />
          </div>
        )}
      </div>
    </div>
  );
}
