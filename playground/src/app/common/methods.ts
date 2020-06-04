export class Methods {
  static values = [
    {
      name: 'GET',
      color: 'norest',
    },
    {
      name: 'POST',
      color: 'alert',
    },
    {
      name: 'PATCH',
      color: 'primary',
    },
    {
      name: 'PUT',
      color: 'basic',
    },
    {
      name: 'DELETE',
      color: 'warn',
    },
  ];

  static getColor(method: string) {
    return Methods.values.find(({ name }) => name === method).color;
  }
}
