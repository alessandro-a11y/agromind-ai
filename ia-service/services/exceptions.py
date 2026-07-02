class GroqServiceError(Exception):
    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class GroqConfigurationError(GroqServiceError):
    def __init__(self) -> None:
        super().__init__("Serviço de IA não configurado.", 503)


class GroqTimeoutError(GroqServiceError):
    def __init__(self) -> None:
        super().__init__("O serviço de IA demorou para responder. Tente novamente em instantes.", 504)


class GroqRateLimitError(GroqServiceError):
    def __init__(self) -> None:
        super().__init__("O limite de uso da IA foi atingido. Tente novamente em alguns minutos.", 429)


class GroqUnavailableError(GroqServiceError):
    def __init__(self) -> None:
        super().__init__("O serviço de IA está temporariamente indisponível.", 503)


class GroqInvalidApiKeyError(GroqServiceError):
    def __init__(self) -> None:
        super().__init__("Credenciais da IA inválidas.", 401)


class GroqUnexpectedResponseError(GroqServiceError):
    def __init__(self) -> None:
        super().__init__("A IA retornou uma resposta inesperada.", 502)
