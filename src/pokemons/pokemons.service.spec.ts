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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(Number),
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

  // ----

  it('should return a pokemon from cache', async () => {
    // const pokemon = {
    //   id: 10001,
    //   name: 'Bulbasaur',
    //   type: 'grass',
    //   hp: 45,
    //   sprites: [],
    // };
    // service.pokemonCache.set(pokemon.id, pokemon);
    // const pokemonReturned = await service.findOne(pokemon.id);
    // expect(pokemonReturned).toEqual(pokemon);

    const id = 1;
    const cacheSpy = jest.spyOn(service.pokemonCache, 'get');

    await service.findOne(id);
    await service.findOne(id);

    expect(cacheSpy).toHaveBeenCalledTimes(1);
  });

  it('should return all pokemons from cache', async () => {
    // const paginationDto = { limit: 5, page: 1 };
    // const cachedPokemons = [
    //   { id: 1, name: 'Bulbasaur', type: 'grass', hp: 45, sprites: [] },
    //   { id: 2, name: 'Ivysaur', type: 'grass', hp: 60, sprites: [] },
    // ];
    // service.paginatedPokemonsCache.set('5-1', cachedPokemons);
    // const result = await service.findAll(paginationDto);
    // expect(result).toEqual(cachedPokemons);

    const paginationDto = { limit: 5, page: 1 };
    const cacheSpy = jest.spyOn(service.paginatedPokemonsCache, 'get');
    const fetchSpy = jest.spyOn(global, 'fetch');

    await service.findAll(paginationDto);
    await service.findAll(paginationDto);

    expect(cacheSpy).toHaveBeenCalledTimes(1);
    expect(cacheSpy).toHaveBeenCalledWith('5-1');
    expect(fetchSpy).toHaveBeenCalledTimes(
      paginationDto.limit + paginationDto.page,
    );
  });

  it('should return BadRequestException error if pokemon name already exist', async () => {
    const createPokemonDto = {
      name: 'Bulbasaur',
      type: 'grass',
    };
    await service.create(createPokemonDto);

    try {
      await service.create(createPokemonDto);
      expect(true).toBeFalsy(); // si llego hasta aca es un error
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(error.message).toBe(
        `Pokemon with name ${createPokemonDto.name} already exists`,
      );
    }
  });

  it('should return a updated pokemon', async () => {
    const pokemonId = '1';
    const newData = { name: 'newPicachu' };

    const updatedPokemon = await service.update(+pokemonId, newData);

    expect(updatedPokemon.name).toBe(newData.name);
    expect(service.pokemonCache.has(+pokemonId)).toBeTruthy();
    expect(service.pokemonCache.get(+pokemonId)).toBe(updatedPokemon);
  });

  it('should return an error with the incorrect id: update', async () => {
    const pokemonId = '-1';
    const newData = { name: 'newPicachu' };

    try {
      await service.update(+pokemonId, newData);
      expect(true).toBeFalsy(); // si llego hasta aca es un error
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(error.message).toBe(`Pokemon with id ${pokemonId} not found`);
    }
  });

  it('should return a successful msg on delete with correct id', async () => {
    const pokemonId = '1';
    await service.findOne(+pokemonId);

    await service.remove(+pokemonId);

    expect(service.pokemonCache.get(+pokemonId)).toBeUndefined();
    expect(service.pokemonCache.has(+pokemonId)).toBeFalsy();
  });

  it('should return an error with the incorrect id: remove', async () => {
    const pokemonId = '-1';
    const pokemon = {
      id: 1,
      name: 'Bulbasaur',
      type: 'grass',
      hp: 45,
      sprites: [],
    };
    service.pokemonCache.set(pokemon.id, pokemon);

    try {
      await service.remove(+pokemonId);
      expect(true).toBeFalsy(); // si llego hasta aca es un error
    } catch (error) {
      expect(service.pokemonCache.has(pokemon.id)).toBeTruthy();
      expect(error).toBeInstanceOf(NotFoundException);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(error.message).toBe(`Pokemon with id ${pokemonId} not found`);
    }
  });
});
