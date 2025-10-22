const getBgColorLight = (color: string, hover: boolean = false) => {
  switch (color) {
    case 'cyan':
      return hover ? 'hover:bg-cyan-200' : 'bg-cyan-100';
      break;
    case 'green':
      return hover ? 'hover:bg-green-200' : 'bg-green-100';
      break;
    case 'orange':
      return hover ? 'hover:bg-orange-200' : 'bg-orange-100';
      break;
    case 'blue':
      return hover ? 'hover:bg-blue-200' : 'bg-blue-100';
      break;
    case 'yellow':
      return hover ? 'hover:bg-yellow-200' : 'bg-yellow-100';
      break;
    case 'red':
      return hover ? 'hover:bg-red-200' : 'bg-red-100';
      break;
    case 'purple':
      return hover ? 'hover:bg-purple-200' : 'bg-purple-100';
      break;
    case 'pink':
      return hover ? 'hover:bg-pink-200' : 'bg-pink-100';
      break;
    case 'gray':
      return hover ? 'hover:bg-gray-200' : 'bg-gray-100';
      break;
    case 'amber':
      return hover ? 'hover:bg-amber-200' : 'bg-amber-100';
      break;
    case 'indigo':
      return hover ? 'hover:bg-indigo-200' : 'bg-indigo-100';
      break;
    case 'teal':
      return hover ? 'hover:bg-teal-200' : 'bg-teal-100';
      break;
      case 'rose':
        return hover ? 'hover:bg-rose-200' : 'bg-rose-100';
        break;
      case 'emerald':
        return hover ? 'hover:bg-emerald-200' : 'bg-emerald-100';
        break;
      case 'teal':
        return hover ? 'hover:bg-teal-200' : 'bg-teal-100';
        break;
      case 'yellow':
        return hover ? 'hover:bg-yellow-200' : 'bg-yellow-100';
      case 'lime':
        return hover ? 'hover:bg-lime-200' : 'bg-lime-100';
      case 'indigo':
        return hover ? 'hover:bg-indigo-200' : 'bg-indigo-100';
      case 'purple':
        return hover ? 'hover:bg-purple-200' : 'bg-purple-100';
        case 'sky':
          return hover ? 'hover:bg-sky-200' : 'bg-sky-100';
  }
}

const getBgColor = (color: string, hover: boolean = false) => {
  console.log(color);
  switch (color) {
    case 'cyan':
      return hover ? 'hover:bg-cyan-500' : 'bg-cyan-500';
      break;
    case 'green':
      return hover ? 'hover:bg-green-500' : 'bg-green-500';
      break;
    case 'orange':
      return hover ? 'hover:bg-orange-500' : 'bg-orange-500';
      break;
    case 'blue':
      return hover ? 'hover:bg-blue-500' : 'bg-blue-500';
      break;
    case 'yellow':
      return hover ? 'hover:bg-yellow-500' : 'bg-yellow-500';
      break;
    case 'red':
      return hover ? 'hover:bg-red-500' : 'bg-red-500';
      break;
    case 'purple':
      return hover ? 'hover:bg-purple-500' : 'bg-purple-500';
      break;
    case 'pink':
      return hover ? 'hover:bg-pink-500' : 'bg-pink-500';
      break;
    case 'gray':
      return hover ? 'hover:bg-gray-500' : 'bg-gray-500';
      break;
    case 'amber':
      return hover ? 'hover:bg-amber-500' : 'bg-amber-500';
      break;
    case 'indigo':
      return hover ? 'hover:bg-indigo-500' : 'bg-indigo-500';
      break;
    case 'teal':
      return hover ? 'hover:bg-teal-500' : 'bg-teal-500';
      break;
    case 'rose':
      return hover ? 'hover:bg-rose-500' : 'bg-rose-500';
      break;
    case 'emerald':
      return hover ? 'hover:bg-emerald-500' : 'bg-emerald-500';
      break;
    case 'lime':
      return hover ? 'hover:bg-lime-500' : 'bg-lime-500';
      break;
    case 'indigo':
      return hover ? 'hover:bg-indigo-500' : 'bg-indigo-500';
      break;
    case 'purple':
      return hover ? 'hover:bg-purple-500' : 'bg-purple-500';
      break;
      case 'sky':
        return hover ? 'hover:bg-sky-500' : 'bg-sky-500';
        break;
  }
}

export { getBgColorLight, getBgColor };