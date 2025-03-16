export default function ms(value: string): number | null {
  const regex = /^(\d+)([dhmswy])$/;
  const match = value.match(regex);

  if (!match) {
    return null;
  }

  const amount = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 's':
      return amount * 1000;
    case 'w':
      return amount * 7 * 24 * 60 * 60 * 1000;
    case 'y':
      return amount * 365 * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}
