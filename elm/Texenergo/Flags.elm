module Texenergo.Flags exposing (OutgoingTransferId(..), ApiAuthToken(..), Endpoint(..), Flags, Flagz, initFlags)


type OutgoingTransferId
    = OutgoingTransferId String


type ApiAuthToken
    = ApiAuthToken String


type Endpoint
    = Endpoint String


type alias Flags =
    { authToken : ApiAuthToken, apiEndpoint : Endpoint, outgoingTransferFlag : OutgoingTransferId }


type alias Flagz =
    { authToken : String, apiEndpoint : String, objId : String }


initFlags : Flagz -> Flags
initFlags fz =
    Flags (ApiAuthToken fz.authToken) (Endpoint fz.apiEndpoint) (OutgoingTransferId fz.objId)
