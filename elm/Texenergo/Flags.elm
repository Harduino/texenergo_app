module Texenergo.Flags
    exposing
        ( ApiAuthToken(..)
        , Endpoint(..)
        , ApiAccessToken(..)
        , Flags
        , Flagz
        , initFlags
        , apiAuthTokenToString
        , endpointToString
        , apiAccessTokenToString
        )


type ApiAuthToken
    = ApiAuthToken String


type Endpoint
    = Endpoint String


type ApiAccessToken
    = ApiAccessToken String


apiAuthTokenToString : ApiAuthToken -> String
apiAuthTokenToString (ApiAuthToken x) =
    x


endpointToString : Endpoint -> String
endpointToString (Endpoint x) =
    x


apiAccessTokenToString : ApiAccessToken -> String
apiAccessTokenToString (ApiAccessToken x) =
    x


type alias Flags =
    { apiAuthToken : ApiAuthToken, apiEndpoint : Endpoint, apiAccessToken : ApiAccessToken }


type alias Flagz =
    { authToken : String, apiEndpoint : String, objId : String, accessToken : String }


initFlags : Flagz -> Flags
initFlags fz =
    Flags (ApiAuthToken fz.authToken) (Endpoint fz.apiEndpoint) (ApiAccessToken fz.accessToken)
