from regex import findall

class MessageCleanUp:
  @staticmethod
  def clean_up(content: str, return_string = False):
    list = findall(r'[A-ZЁА-Яa-zёа-я]', content)
    return list if not return_string else "".join(list)

  @staticmethod
  def caps_symbols(content:str, return_string=False):
    list = findall(r'[A-ZЁА-Я]', content)
    return list if not return_string else "".join(list)
