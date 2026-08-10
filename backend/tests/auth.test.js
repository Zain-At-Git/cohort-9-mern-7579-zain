const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

const db = require('../config/db');
const authController = require('../controllers/authController');

describe('Auth Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        next = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('signup', () => {
        it('should return 400 if fields are missing', async () => {
            req.body = { name: '', email: '', password: '' };

            await authController.signup(req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWithMatch({ success: false })).to.be.true;
        });

        it('should return 400 if password exceeds 72 bytes', async () => {
            req.body = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'a'.repeat(73),
            };

            await authController.signup(req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWithMatch({ message: 'Password is too long (max 72 bytes)' })).to.be.true;
        });

        it('should return 400 if email format is invalid', async () => {
            req.body = {
                name: 'Test User',
                email: 'not-an-email',
                password: 'password123',
            };

            await authController.signup(req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
        });

        it('should return 400 if user already exists', async () => {
            req.body = {
                name: 'Test User',
                email: 'existing@example.com',
                password: 'password123',
            };

            sinon.stub(db, 'query').resolves([[{ id: 1, email: 'existing@example.com' }]]);

            await authController.signup(req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWithMatch({ message: 'User already exists' })).to.be.true;
        });
    });

    describe('login', () => {
        it('should return 400 if email or password missing', async () => {
            req.body = { email: '', password: '' };

            await authController.login(req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
        });

        it('should return 401 if user does not exist', async () => {
            req.body = { email: 'nouser@example.com', password: 'password123' };

            sinon.stub(db, 'query').resolves([[]]);

            await authController.login(req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.calledWithMatch({ message: 'Invalid credentials' })).to.be.true;
        });
    });
});