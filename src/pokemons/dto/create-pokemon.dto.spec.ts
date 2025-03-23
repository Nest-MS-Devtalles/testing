import { validate } from 'class-validator';

import { CreatePokemonDto } from './create-pokemon.dto';

describe('create-pokemon.dto.spec', () => {
  it('should validate with default values', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'name';
    dto.type = 'fire';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should validate with valid data', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'name';
    dto.type = 'fire';
    dto.hp = 1;
    dto.sprites = ['hi'];

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should not validate with type undefined', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'name';

    const errors = await validate(dto);
    const typeError = errors.find((error) => error.property === 'type');

    expect(typeError).toBeDefined();
  });

  it('should not validate with invalid hp', async () => {
    const dto = new CreatePokemonDto();
    dto.name = '2';
    dto.type = 'fire';
    dto.hp = -10;

    const errors = await validate(dto);
    const hpError = errors.find((error) => error.property === 'hp');
    const constraints = hpError?.constraints;

    expect(hpError).toBeDefined();
    expect(constraints).toEqual({ min: 'hp must not be less than 0' });
  });

  it('should not validate with invalid sprites', async () => {
    const dto = new CreatePokemonDto();
    dto.name = '2';
    dto.type = 'fire';
    dto.sprites = [123, 234] as unknown as string[];

    const errors = await validate(dto);
    const spritesError = errors.find((error) => error.property === 'sprites');

    expect(spritesError).toBeDefined();
  });
});
