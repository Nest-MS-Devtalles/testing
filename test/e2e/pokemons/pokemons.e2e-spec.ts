import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../../../src/app.module';
import { Pokemon } from '../../../src/pokemons/entities/pokemon.entity';

describe('Pokemons (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  it('/pokemons (POST) - with no body', async () => {
    const response = await request(app.getHttpServer()).post('/pokemons');

    // eslint-disable-next-line
    const messageArray = response.body.message ?? [];

    expect(response.statusCode).toBe(400);
    expect(messageArray).toContain('name must be a string');
    expect(messageArray).toContain('name should not be empty');
    expect(messageArray).toContain('type must be a string');
    expect(messageArray).toContain('type should not be empty');
  });

  it('/pokemons (POST) - with valid body', async () => {
    const pokemon = {
      name: 'Pikachu',
      type: 'Electric',
    };

    const response = await request(app.getHttpServer())
      .post('/pokemons')
      .send(pokemon);

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      name: 'Pikachu',
      type: 'Electric',
      hp: 0,
      sprites: [],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(Number),
    });
  });

  it('/pokemons (GET) should return paginated list of pokemons', async () => {
    const response = await request(app.getHttpServer()).get('/pokemons').query({
      limit: 5,
      page: 1,
    });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.length).toBe(5);

    (response.body as Pokemon[]).forEach((pokemon) => {
      expect(pokemon).toHaveProperty('id');
      expect(pokemon).toHaveProperty('name');
      expect(pokemon).toHaveProperty('type');
      expect(pokemon).toHaveProperty('hp');
      expect(pokemon).toHaveProperty('sprites');
    });
  });

  it('/pokemons/:id (GET) should return a pokemon by ID', async () => {
    const pokemonId = 1;
    const response = await request(app.getHttpServer()).get(
      `/pokemons/${pokemonId}`,
    );

    const pokemonRes = response.body as Pokemon;

    expect(response.statusCode).toBe(200);
    expect(pokemonRes.id).toBe(pokemonId);
    expect(pokemonRes).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      name: expect.any(String),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: expect.any(String),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      hp: expect.any(Number),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      sprites: expect.any(Array),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(Number),
    });
  });

  it('/pokemons/:id (GET) should return Not found', async () => {
    const pokemonId = -1;
    const response = await request(app.getHttpServer()).get(
      `/pokemons/${pokemonId}`,
    );

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      message: `Pokemon with id ${pokemonId} not found`,
      error: 'Not Found',
      statusCode: 404,
    });
  });

  it('/pokemons/:id (PATCH) should update pokemon', async () => {
    const pokemonId = '1';
    const pokemonNewData = {
      name: 'newName',
    };

    const response = await request(app.getHttpServer())
      .patch(`/pokemons/${pokemonId}`)
      .send(pokemonNewData);
    const pokemonRes = response.body as Pokemon;

    expect(response.statusCode).toBe(200);
    expect(pokemonRes.name).toBe(pokemonNewData.name);
    expect(pokemonRes.id).toBe(+pokemonId);
  });

  it('/pokemons/:id (PATCH) should throw an 404 ', async () => {
    const pokemonId = '-1';

    const pokemonNewData = {
      name: 'newName',
    };

    const response = await request(app.getHttpServer())
      .patch(`/pokemons/${pokemonId}`)
      .send(pokemonNewData);

    expect(response.statusCode).toBe(404);
  });

  it('/pokemons/:id (DELETE) should delete pokemon ', async () => {
    const pokemonId = '1';

    const response = await request(app.getHttpServer()).get(
      `/pokemons/${pokemonId}`,
    );
    const pokemonRes = response.body as Pokemon;
    const pokemonName = pokemonRes.name;

    const responseDelete = await request(app.getHttpServer()).delete(
      `/pokemons/${pokemonId}`,
    );

    expect(responseDelete.statusCode).toBe(200);
    expect(responseDelete.text).toBe(`Pokemon ${pokemonName} removed`);
  });

  it('/pokemons/:id (DELETE) should return 404 ', async () => {
    const pokemonId = '-1';

    const response = await request(app.getHttpServer()).get(
      `/pokemons/${pokemonId}`,
    );

    expect(response.statusCode).toBe(404);
  });
});
