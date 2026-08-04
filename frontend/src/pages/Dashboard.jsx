import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

function Dashboard() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const navigate = useNavigate();

    const userName = localStorage.getItem('userName');

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const res = await API.get('/notes');
            setNotes(res.data.notes);
        } catch (err) {
            setError('Failed to load notes');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        const confirmDelete = window.confirm('Delete this note? This cannot be undone.');
        if (!confirmDelete) return;

        try {
            await API.delete(`/notes/${id}`);
            setNotes(notes.filter((note) => note.id !== id));
            toast.success('Note deleted');
        } catch (err) {
            toast.error('Failed to delete note');
        }
    };

    const handleTogglePin = async (e, id) => {
        e.stopPropagation();
        try {
            const res = await API.patch(`/notes/${id}/pin`);
            setNotes((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_pinned: res.data.isPinned } : n))
            );
            toast.success(res.data.message);
        } catch (err) {
            toast.error('Failed to update pin');
        }
    };

    const handleEdit = (e, id) => {
        e.stopPropagation();
        navigate(`/notes/${id}`);
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

    const getWordCount = (html) => {
        const text = getPlainText(html);
        return text ? text.split(' ').filter(Boolean).length : 0;
    };

    const getRelativeTime = (dateStr) => {
        const diff = (Date.now() - new Date(dateStr)) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const sortNotes = (list) => {
        const sorted = [...list];
        const compareFn = (a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.updated_at) - new Date(b.updated_at);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'newest':
                default:
                    return new Date(b.updated_at) - new Date(a.updated_at);
            }
        };
        return sorted.sort((a, b) => {
            if (a.is_pinned !== b.is_pinned) return b.is_pinned - a.is_pinned;
            return compareFn(a, b);
        });
    };

    const filteredNotes = sortNotes(
        notes.filter((note) => note.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalWords = notes.reduce((sum, n) => sum + getWordCount(n.content), 0);

    return (
        <div className="db">
            <nav className="db-nav">
                <div className="db-nav-left">
                    <div className="db-logo">N</div>
                    <span className="db-nav-title">Notes</span>
                </div>

                <div className="db-nav-search">
                    <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search your notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Escape' && setSearchTerm('')}
                    />
                </div>

                <div className="db-nav-right">
                    <button className="btn-primary" onClick={() => navigate('/notes/new')}>
                        + New Note
                    </button>
                    <div className="db-user-avatar" title={userName || 'User'}>
                        {userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <button className="db-logout-btn" onClick={handleLogout} title="Logout">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="db-header">
                <div>
                    <h1>{userName ? `Welcome back, ${userName.split(' ')[0]}` : 'Your Notes'}</h1>
                    <p className="db-subtext">
                        {notes.length} {notes.length === 1 ? 'note' : 'notes'} · {totalWords} words total
                    </p>
                </div>

                <select
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title A-Z</option>
                </select>
            </div>

            {error && <p className="dashboard-error">{error}</p>}

            {loading ? (
                <div className="spinner"></div>
            ) : filteredNotes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">{searchTerm ? '🔍' : '📝'}</div>
                    <h3>{searchTerm ? 'No matching notes' : 'No notes yet'}</h3>
                    <p>{searchTerm ? 'Try a different search term' : 'Create your first note to get started'}</p>
                    {!searchTerm && (
                        <button className="btn-primary" onClick={() => navigate('/notes/new')}>
                            + Create Note
                        </button>
                    )}
                </div>
            ) : (
                <div className="notes-masonry">
                    {filteredNotes.map((note) => (
                        <div
                            key={note.id}
                            className={`note-tile ${note.is_pinned ? 'note-tile-pinned' : ''}`}
                            onClick={() => navigate(`/notes/${note.id}`)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    navigate(`/notes/${note.id}`);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="note-tile-top">
                                <h3>{note.title}</h3>
                                <div className="note-tile-actions">
                                    <button
                                        className={`btn-icon ${note.is_pinned ? 'btn-icon-pinned' : ''}`}
                                        onClick={(e) => handleTogglePin(e, note.id)}
                                        title={note.is_pinned ? 'Unpin note' : 'Pin note'}
                                    >
                                        📌
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={(e) => handleEdit(e, note.id)}
                                        title="Edit note"
                                    >
                                        ✎
                                    </button>
                                    <button
                                        className="btn-icon btn-icon-delete"
                                        onClick={(e) => handleDelete(e, note.id)}
                                        title="Delete note"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            <p className="note-tile-preview">
                                {getPlainText(note.content).slice(0, 140) || 'No additional text'}
                            </p>
                            <div className="note-tile-footer">
                                <span>{getRelativeTime(note.updated_at)}</span>
                                <span className="dot">·</span>
                                <span>{getWordCount(note.content)} words</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;