import * as supertest from 'supertest';
import {default as app} from '../src/server';

const request = supertest('http://localhost:8000');

describe('GET /hello', () => {
  it('should return 200 OK', () => {
    request
      .get('/hello')
      .expect(200);
  });
});
