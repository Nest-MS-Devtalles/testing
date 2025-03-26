import { Test, TestingModule } from '@nestjs/testing';

import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { Pokemon } from './entities/pokemon.entity';

const mockPokemons: Pokemon[] = [
  {
    id: 1,
    name: 'bulbasaur',
    type: 'grass',
    hp: 45,
    sprites: [
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png',
    ],
  },
  {
    id: 2,
    name: 'ivysaur',
    type: 'grass',
    hp: 60,
    sprites: [
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png',
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/2.png',
    ],
  },
];

describe('PokemonsController', () => {
  let controller: PokemonsController;
  let service: PokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonsController],
      providers: [PokemonsService],
    }).compile();

    controller = module.get<PokemonsController>(PokemonsController);
    service = module.get<PokemonsService>(PokemonsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have called the service with correct parameter', async () => {
    const dto: PaginationDto = { limit: 10, page: 1 };

    jest.spyOn(service, 'findAll');

    await controller.findAll(dto);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.findAll).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.findAll).toHaveBeenCalledWith(dto);
  });

  it('should have called the service and check the result', async () => {
    const dto: PaginationDto = { limit: 10, page: 1 };

    jest
      .spyOn(service, 'findAll')
      .mockImplementation(() => Promise.resolve(mockPokemons));

    const pokemons = await controller.findAll(dto);

    expect(pokemons).toBe(mockPokemons);
  });

  it('should have called the service with correct id (findOne)', async () => {
    const pokemonId = '4';

    const spy = jest
      .spyOn(service, 'findOne')
      .mockImplementation(() => Promise.resolve(mockPokemons[0]));

    const pokemon = await controller.findOne(pokemonId);

    expect(spy).toHaveBeenCalledWith(+pokemonId);
    expect(pokemon).toEqual(mockPokemons[0]);
  });

  it('should have called the service with correct id and data (update)', async () => {
    const pokemonId = '4';
    const newData = { name: 'newPikachu' };

    const spy = jest
      .spyOn(service, 'update')
      .mockImplementation(() =>
        Promise.resolve({ ...mockPokemons[0], name: newData.name }),
      );

    await controller.update(pokemonId, newData);

    expect(spy).toHaveBeenCalledWith(+pokemonId, newData);
  });

  it('should have called delete with the correct id (delete)', async () => {
    const pokemonId = '4';

    const spy = jest
      .spyOn(service, 'remove')
      .mockImplementation(() => Promise.resolve('Pokemon removed'));

    const result = await controller.remove(pokemonId);

    expect(spy).toHaveBeenCalledWith(+pokemonId);
    expect(result).toBe('Pokemon removed');
  });

  // ----

  it('should have called the service with correct data (create)', async () => {
    const newData = { name: mockPokemons[0].name, type: mockPokemons[0].type };
    const spy = jest
      .spyOn(service, 'create')
      .mockImplementation(() => Promise.resolve(mockPokemons[0]));

    await controller.create(newData);

    expect(spy).toHaveBeenCalledWith(newData);
  });
});
