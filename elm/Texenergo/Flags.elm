module Texenergo.Flags exposing (ApiAuthToken(..), Endpoint(..), ApiAccessToken(..), Flags, Flagz, initFlags)


type ApiAuthToken
    = ApiAuthToken String


type Endpoint
    = Endpoint String


type ApiAccessToken
    = ApiAccessToken String


type alias Flags =
    { apiAuthToken : ApiAuthToken, apiEndpoint : Endpoint, apiAccessToken : ApiAccessToken }


type alias Flagz =
    { authToken : String, apiEndpoint : String, objId : String, accessToken : String }


initFlags : Flagz -> Flags
initFlags fz =
    Flags (ApiAuthToken fz.authToken) (Endpoint fz.apiEndpoint) (ApiAccessToken fz.accessToken)
