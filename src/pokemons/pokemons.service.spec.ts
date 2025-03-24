import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { PokemonsService } from './pokemons.service';

describe('PokemonsService', () => {
  let service: PokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokemonsService],
    }).compile();

    service = module.get<PokemonsService>(PokemonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a pokemon', async () => {
    const data = { name: 'Pikachu', type: 'electrik' };

    const result = await service.create(data);

    expect(result).toBe(`This action adds a: ${data.name}`);
  });

  it('should return pokemon if exists', async () => {
    const pokemonId = 4;

    const result = await service.findOne(pokemonId);

    expect(result.id).toBe(pokemonId);
  });

  it("should return 404 error if pokemon doesn't exist", async () => {
    const pokemonId = -1;

    await expect(service.findOne(pokemonId)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(pokemonId)).rejects.toThrow(
      `Pokemon with id ${pokemonId} not found`,
    );
  });

  it('should find all pokemons and cache them', async () => {
    const pokemons = await service.findAll({ limit: 10, page: 1 });

    expect(pokemons).toBeInstanceOf(Array);
    expect(pokemons.length).toBe(10);

    expect(service.paginatedPokemonsCache.has('10-1')).toBeTruthy();
    expect(service.paginatedPokemonsCache.get('10-1')).toBe(pokemons);
  });

  it('should check properties of the pokemon', async () => {
    const pokemonId = 4;

    const result = await service.findOne(pokemonId);

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name');
    expect(result).toEqual(
      expect.objectContaining({
        id: pokemonId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        hp: expect.any(Number),
      }),
    );
  });
});
