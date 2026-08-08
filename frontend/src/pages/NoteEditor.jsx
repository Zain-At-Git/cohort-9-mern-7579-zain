import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import API from '../api/axios';
import toast from 'react-hot-toast';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
};

function NoteEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const draftKey = `note-draft-${id || 'new'}`;


  const requestIdRef = useRef(0);

  useEffect(() => {
    
    setTitle('');
    setContent('');
    setError('');

    if (isEditMode) {
      fetchNote(id);
    } else {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || '');
        setContent(draft.content || '');
      }
    }
  }, [id]);

  useEffect(() => {
  requestIdRef.current++; // pehle hi invalidate karo

  setTitle('');
  setContent('');
  setError('');

  if (isEditMode) {
    fetchNote(id);
  } else {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || '');
        setContent(draft.content || '');
      }
    } catch (err) {
      localStorage.removeItem(draftKey);
    }
  }
}, [id]);

  useEffect(() => {
    if (!title && !getWordCount()) return;
    const timer = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({ title, content }));
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, content]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, loading]);

  const fetchNote = async (noteId) => {
    const currentRequestId = ++requestIdRef.current;

    try {
      setFetching(true);
      const res = await API.get(`/notes/${noteId}`);

      if (currentRequestId !== requestIdRef.current) return;

      setTitle(res.data.note.title);
      setContent(res.data.note.content);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      setError('Failed to load note');
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setFetching(false);
      }
    }
  };

  const getPlainText = (html) => {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getWordCount = () => {
    const text = getPlainText(content);
    return text ? text.split(' ').filter(Boolean).length : 0;
  };

  const handleSave = async () => {
    if (loading || fetching) return; 

    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      if (isEditMode) {
        await API.put(`/notes/${id}`, { title, content });
      } else {
        await API.post('/notes', { title, content });
      }
      localStorage.removeItem(draftKey);
      toast.success(isEditMode ? 'Note updated' : 'Note created');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save note';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem(draftKey);
    navigate('/dashboard');
  };

  if (fetching) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="editor-container">
      <div className="editor-box">
        <div className="editor-header">
          <h2>{isEditMode ? 'Edit Note' : 'New Note'}</h2>
          <span className="editor-hint">Ctrl+S to save</span>
        </div>

        {error && (
          <p id="note-title-error" className="auth-error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        <label htmlFor="note-title" className="sr-only">
          Note title
        </label>
        <input
          id="note-title"
          type="text"
          className="editor-title-input"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'note-title-error' : undefined}
        />

        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={quillModules}
          className="editor-quill"
          placeholder="Write your note here..."
        />

        <div className="editor-footer">
          <span className="editor-word-count">{getWordCount()} words</span>
          <div className="editor-actions">
            <button className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={loading || fetching}>
              {loading ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteEditor;