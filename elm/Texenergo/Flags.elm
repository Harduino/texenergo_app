module Texenergo.Flags exposing (ApiAuthToken(..), Endpoint(..), Flags, Flagz, initFlags)


type ApiAuthToken
    = ApiAuthToken String


type Endpoint
    = Endpoint String


type alias Flags =
    { apiAuthToken : ApiAuthToken, apiEndpoint : Endpoint }


type alias Flagz =
    { authToken : String, apiEndpoint : String, objId : String }


initFlags : Flagz -> Flags
initFlags fz =
    Flags (ApiAuthToken fz.authToken) (Endpoint fz.apiEndpoint)
