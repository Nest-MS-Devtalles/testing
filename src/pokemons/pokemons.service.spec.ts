import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
    const data = {
      id: new Date().getDate(),
      name: 'Pikachu',
      type: 'electrik',
    };

    const result = await service.create(data);

    expect(result).toEqual({
      hp: 0,
      id: data.id,
      name: data.name,
      sprites: [],
      type: data.type,
    });
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

  // --

  it('should find all pokemons in cache', async () => {
    const paginationDto = { limit: 5, page: 1 };

    const cachedPokemons = [
      { id: 1, name: 'Bulbasaur', type: 'grass', hp: 45, sprites: [] },
      { id: 2, name: 'Ivysaur', type: 'grass', hp: 60, sprites: [] },
    ];

    service.paginatedPokemonsCache.set('5-1', cachedPokemons);

    const result = await service.findAll(paginationDto);
    expect(result).toEqual(cachedPokemons);
  });

  it('should return BadRequestException error if pokemon name already exist', async () => {
    const pokemon = {
      id: 1,
      name: 'Bulbasaur',
      type: 'grass',
      hp: 45,
      sprites: [],
    };

    service.pokemonCache.set(pokemon.id, pokemon);

    const createPokemonDto = {
      name: 'Bulbasaur',
      type: 'grass',
    };

    try {
      await service.create(createPokemonDto);
      fail('Expected BadRequestException was not thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        `Pokemon with name ${pokemon.name} already exists`,
      );
    }

    // await expect(service.create(createPokemonDto)).rejects.toThrow(
    //   new BadRequestException('hi'),
    // );

    // await expect(service.findOne(pokemonId)).rejects.toThrow();
    // await expect(service.findOne(pokemonId)).rejects.toThrow(
    //   `Pokemon with id ${pokemonId} not found`,
    // );
  });
});
