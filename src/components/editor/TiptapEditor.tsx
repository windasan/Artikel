'use client'
// src/components/editor/TiptapEditor.tsx

import { useEffect } from 'react'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Typography from '@tiptap/extension-typography'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Link2, Image as ImgIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Code2, Minus, Undo2, Redo2,
  Heading2, Heading3, Table as TableIcon, Superscript as SupIcon,
  Subscript as SubIcon, Highlighter, CheckSquare,
} from 'lucide-react'

interface TiptapEditorProps {
  content: string | Record<string, unknown> | null
  onChange: (html: string, json: Record<string, unknown>) => void
  readOnly?: boolean
}

// Toolbar button component
function TBtn({
  onClick, active, title, children, disabled,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors text-[12px] ${
        active
          ? 'bg-[rgba(240,128,96,0.15)] text-[var(--coral)]'
          : 'hover:bg-[rgba(28,43,43,0.07)] text-[var(--ink-md)]'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-5 bg-[rgba(28,43,43,0.1)] mx-1 self-center" />
}

export function TiptapEditor({ content, onChange, readOnly = false }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: { HTMLAttributes: { class: 'bg-[var(--ink)] text-[var(--cream)] rounded-xl p-4 my-4 text-sm overflow-x-auto' } },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl w-full my-4' } }),
      Placeholder.configure({ placeholder: 'Mulai menulis artikel Anda di sini...\n\nGunakan toolbar di atas untuk memformat teks.' }),
      CharacterCount,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Superscript,
      Subscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      Typography,
    ],
    content: content as string ?? '',
    editable: !readOnly,
    onUpdate({ editor }) {
      onChange(editor.getHTML(), editor.getJSON() as Record<string, unknown>)
    },
    editorProps: {
      attributes: { class: 'tiptap-editor focus:outline-none' },
    },
  })

  // Update content from outside
  useEffect(() => {
    if (!editor || !content) return
    if (typeof content === 'string' && editor.getHTML() !== content) {
      editor.commands.setContent(content)
    } else if (typeof content === 'object' && content !== null) {
      editor.commands.setContent(content as Parameters<typeof editor.commands.setContent>[0])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null

  const addLink = () => {
    const prev = editor.getAttributes('link').href ?? ''
    const url = window.prompt('URL:', prev)
    if (url === null) return
    if (!url) { editor.chain().focus().unsetLink().run(); return }
    editor.chain().focus().setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('URL Gambar:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="flex flex-col">
      {/* ── Toolbar ── */}
      {!readOnly && (
        <div className="sticky top-[60px] z-20 bg-[var(--paper)] border-t border-b border-[rgba(28,43,43,0.08)] py-2 -mx-8 px-8 flex flex-wrap items-center gap-0.5 mb-5">
          {/* Heading */}
          <select
            onChange={e => {
              const v = e.target.value
              if (v === 'p') editor.chain().focus().setParagraph().run()
              else editor.chain().focus().toggleHeading({ level: Number(v) as 2|3|4 }).run()
            }}
            value={
              editor.isActive('heading', { level: 2 }) ? '2'
              : editor.isActive('heading', { level: 3 }) ? '3'
              : editor.isActive('heading', { level: 4 }) ? '4'
              : 'p'
            }
            className="border border-[rgba(28,43,43,0.12)] rounded-md px-2 py-1 text-[12px] text-[var(--ink)] bg-transparent outline-none cursor-pointer mr-1"
          >
            <option value="p">Paragraf</option>
            <option value="2">Judul 2</option>
            <option value="3">Judul 3</option>
            <option value="4">Judul 4</option>
          </select>

          <Sep />

          {/* Formatting */}
          <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
            <Bold size={13} />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
            <Italic size={13} />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
            <UnderlineIcon size={13} />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
            <Strikethrough size={13} />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
            <Highlighter size={13} />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript">
            <SupIcon size={13} />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript">
            <SubIcon size={13} />
          </TBtn>

          <Sep />

          {/* Alignment */}
          <TBtn onClick={() => editor.chain().focus().setTextAlign('left').run()}   active={editor.isActive({ textAlign: 'left' })}    title="Rata Kiri"><AlignLeft size={13} /></TBtn>
          <TBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}  title="Rata Tengah"><AlignCenter size={13} /></TBtn>
          <TBtn onClick={() => editor.chain().focus().setTextAlign('right').run()}  active={editor.isActive({ textAlign: 'right' })}   title="Rata Kanan"><AlignRight size={13} /></TBtn>
          <TBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Rata Kanan-Kiri"><AlignJustify size={13} /></TBtn>

          <Sep />

          {/* Lists */}
          <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
            <List size={13} />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
            <ListOrdered size={13} />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Task List">
            <CheckSquare size={13} />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Kutipan">
            <Quote size={13} />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
            <Code size={13} />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
            <Code2 size={13} />
          </TBtn>

          <Sep />

          {/* Insert */}
          <TBtn onClick={addLink} active={editor.isActive('link')} title="Tambah Link">
            <Link2 size={13} />
          </TBtn>
          <TBtn onClick={addImage} active={false} title="Tambah Gambar">
            <ImgIcon size={13} />
          </TBtn>
          <TBtn onClick={addTable} active={false} title="Tambah Tabel">
            <TableIcon size={13} />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Garis Pemisah">
            <Minus size={13} />
          </TBtn>

          <Sep />

          {/* History */}
          <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo" active={false}>
            <Undo2 size={13} />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo" active={false}>
            <Redo2 size={13} />
          </TBtn>
        </div>
      )}

      {/* ── Bubble Menu (appears on text selection) ── */}
      {!readOnly && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-0.5 bg-[var(--ink)] rounded-xl p-1.5 shadow-lg"
        >
          {[
            { onClick: () => editor.chain().focus().toggleBold().run(),    active: editor.isActive('bold'),    title: 'B',  label: <Bold size={12}/> },
            { onClick: () => editor.chain().focus().toggleItalic().run(),  active: editor.isActive('italic'),  title: 'I',  label: <Italic size={12}/> },
            { onClick: () => editor.chain().focus().toggleUnderline().run(),active: editor.isActive('underline'),title:'U',label: <UnderlineIcon size={12}/> },
            { onClick: addLink, active: editor.isActive('link'), title: 'Link', label: <Link2 size={12}/> },
          ].map((btn, i) => (
            <button key={i} type="button" onClick={btn.onClick} title={btn.title}
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                btn.active ? 'bg-[var(--coral)] text-white' : 'text-white/70 hover:text-white hover:bg-white/15'
              }`}>
              {btn.label}
            </button>
          ))}
        </BubbleMenu>
      )}

      {/* ── Editor Content ── */}
      <EditorContent editor={editor} />
    </div>
  )
}
