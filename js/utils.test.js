import { expect, test, describe } from 'vitest';
import { capitalizar, calcularPrecioTotalProducto } from './utils.js';

describe('capitalizar', () => {
  test('debe capitalizar una cadena en minúsculas', () => {
    expect(capitalizar('hola')).toBe('Hola');
  });

  test('debe manejar una cadena ya capitalizada', () => {
    expect(capitalizar('Mundo')).toBe('Mundo');
  });

  test('debe manejar una cadena en mayúsculas', () => {
    expect(capitalizar('PRUEBA')).toBe('Prueba');
  });

  test('debe manejar una cadena vacía', () => {
    expect(capitalizar('')).toBe('');
  });

  test('debe manejar una cadena con una sola letra', () => {
    expect(capitalizar('a')).toBe('A');
  });
});

describe('calcularPrecioTotalProducto', () => {
  test('debe calcular el precio para unidades (ud) sin decimales', () => {
    expect(calcularPrecioTotalProducto(2, 'ud', 5)).toBe(10);
  });

  test('debe calcular el precio para unidades (ud) con decimales', () => {
    expect(calcularPrecioTotalProducto(3, 'ud', 1.5)).toBe(4.5);
  });

  test('debe calcular el precio para kilogramos (kg)', () => {
    expect(calcularPrecioTotalProducto(1.5, 'kg', 2)).toBe(3);
  });

  test('debe calcular el precio para gramos (g) y redondear correctamente', () => {
    // 750g a 2.50 €/kg = 1.875, debería redondearse a 1.88
    expect(calcularPrecioTotalProducto(750, 'g', 2.50)).toBe(1.88);
  });

  test('debe manejar un caso propenso a errores de punto flotante', () => {
    // 0.1 + 0.2 en JS es 0.30000000000000004, la función debe corregir esto.
    // Aquí simulamos un cálculo que daría ese tipo de error: 10 ud a 0.1€/ud = 1
    // 20 ud a 0.1€/ud = 2. El total es 3. La función no suma, solo calcula.
    // Un caso mejor: 1 ud a 0.1€ y 1 ud a 0.2€. El test es unitario.
    // Probemos un cálculo que resulte en muchos decimales.
    // 100g a 1.23 €/kg = 0.123, debería redondearse a 0.12
    expect(calcularPrecioTotalProducto(100, 'g', 1.23)).toBe(0.12);
  });

  test('debe devolver 0 si el precio es 0', () => {
    expect(calcularPrecioTotalProducto(10, 'ud', 0)).toBe(0);
  });

  test('debe devolver 0 si la cantidad es 0', () => {
    expect(calcularPrecioTotalProducto(0, 'ud', 10)).toBe(0);
  });

  test('debe devolver el precio unitario si la cantidad no se proporciona (es 0 o null)', () => {
    expect(calcularPrecioTotalProducto(null, 'ud', 5.55)).toBe(5.55);
  });

  test('debe redondear a 0 un valor muy pequeño que es menor a medio céntimo', () => {
    // 1g a 0.2 €/kg = 0.0002€, que redondeado es 0.00€
    expect(calcularPrecioTotalProducto(1, 'g', 0.2)).toBe(0);
  });
});