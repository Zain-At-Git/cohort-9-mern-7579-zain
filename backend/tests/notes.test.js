const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

const db = require('../config/db');
const noteController = require('../controllers/noteController');

describe('Note Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            user: { userId: 1 },
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        next = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('createNote', () => {
        it('should return 400 if title is missing', async () => {
            req.body = { title: '', content: 'some content' };

            await noteController.createNote(req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWithMatch({ message: 'Title is required' })).to.be.true;
        });

        it('should create a note successfully', async () => {
            req.body = { title: 'My Note', content: 'Note content' };

            sinon.stub(db, 'query').resolves([{ insertId: 42 }]);

            await noteController.createNote(req, res, next);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWithMatch({ success: true, noteId: 42 })).to.be.true;
        });
    });

    describe('getNotes', () => {
        it('should return notes for the logged-in user', async () => {
            const mockNotes = [
                { id: 1, title: 'Note 1', content: 'Content 1' },
                { id: 2, title: 'Note 2', content: 'Content 2' },
            ];

            sinon.stub(db, 'query').resolves([mockNotes]);

            await noteController.getNotes(req, res, next);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ success: true, notes: mockNotes })).to.be.true;
        });
    });

    describe('getNoteById', () => {
        it('should return 404 if note not found', async () => {
            req.params.id = 999;
            sinon.stub(db, 'query').resolves([[]]);

            await noteController.getNoteById(req, res, next);

            expect(res.status.calledWith(404)).to.be.true;
        });

        it('should return the note if found', async () => {
            req.params.id = 1;
            const mockNote = { id: 1, title: 'My Note', content: 'Content' };
            sinon.stub(db, 'query').resolves([[mockNote]]);

            await noteController.getNoteById(req, res, next);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ note: mockNote })).to.be.true;
        });
    });

    describe('updateNote', () => {
        it('should return 400 if title is empty', async () => {
            req.params.id = 1;
            req.body = { title: '', content: 'content' };

            await noteController.updateNote(req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
        });

        it('should return 404 if note not found or not owned by user', async () => {
            req.params.id = 999;
            req.body = { title: 'Updated Title', content: 'Updated content' };

            sinon.stub(db, 'query').resolves([{ affectedRows: 0 }]);

            await noteController.updateNote(req, res, next);

            expect(res.status.calledWith(404)).to.be.true;
        });

        it('should update the note successfully', async () => {
            req.params.id = 1;
            req.body = { title: 'Updated Title', content: 'Updated content' };

            sinon.stub(db, 'query').resolves([{ affectedRows: 1 }]);

            await noteController.updateNote(req, res, next);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ success: true, message: 'Note updated' })).to.be.true;
        });
    });

    describe('deleteNote', () => {
        it('should return 404 if note not found', async () => {
            req.params.id = 999;
            sinon.stub(db, 'query').resolves([{ affectedRows: 0 }]);

            await noteController.deleteNote(req, res, next);

            expect(res.status.calledWith(404)).to.be.true;
        });

        it('should delete the note successfully', async () => {
            req.params.id = 1;
            sinon.stub(db, 'query').resolves([{ affectedRows: 1 }]);

            await noteController.deleteNote(req, res, next);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ success: true, message: 'Note deleted' })).to.be.true;
        });
    });
});