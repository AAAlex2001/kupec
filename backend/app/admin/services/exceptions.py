class UserNotDeletableError(ValueError):
    """Этого пользователя удалять нельзя: это вы сами или другой администратор."""
