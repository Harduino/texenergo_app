module ProductLogs exposing (..)

import Date exposing (Date)
import Http
import Html exposing (div, text, tr, td, th)
import Html.Attributes exposing (class, style, colspan)
import Html.Events exposing (onClick)
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required, optional)
import RemoteData exposing (WebData)
import Utils.Currency exposing (toCurrency)
import Utils.Date
import Texenergo.Flags exposing (..)
import Html.Texenergo exposing (pageHeader)


type Msg
    = FetchedProductLogs (WebData (List Log))
    | DestroyProductLog ProductLogId
    | DestroyedProductLog ProductLogId (Result Http.Error ())


type ProductId
    = ProductId String


type ProductLogId
    = ProductLogId String


type alias NameChange =
    { from : String
    , to : String
    }


type alias PriceChange =
    { from : Float
    , to : Float
    }


type alias StockChange =
    { from : Float
    , to : Float
    }


type alias Log =
    { id : ProductLogId
    , canDestroy : Bool
    , createdAt : Date
    , foreignCode : String
    , partnerName : String
    , nameChange : NameChange
    , priceChange : PriceChange
    , stockChange : StockChange
    }


type alias Model =
    { logs : WebData (List Log)
    , flags : Flags
    , productId : ProductId
    }


destroyProductLog : Endpoint -> ApiAuthToken -> ProductId -> ProductLogId -> Cmd Msg
destroyProductLog (Endpoint aep) (ApiAuthToken at) (ProductId pid) (ProductLogId plid) =
    let
        endpoint =
            aep ++ "/products/" ++ pid ++ "/partner_logs/" ++ plid
    in
        Http.request
            { method = "DELETE"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ at)
                ]
            , url = endpoint
            , body = Http.emptyBody
            , expect = Http.expectStringResponse (\_ -> Ok ())
            , timeout = Nothing
            , withCredentials = False
            }
            |> Http.send (DestroyedProductLog (ProductLogId plid))


fetchProductLogs : Endpoint -> ApiAuthToken -> String -> Cmd Msg
fetchProductLogs (Endpoint aep) (ApiAuthToken at) pid =
    let
        endpoint =
            aep ++ "/products/" ++ pid ++ "/partner_logs"
    in
        Http.request
            { method = "GET"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ at)
                ]
            , url = endpoint
            , body = Http.emptyBody
            , expect = Http.expectJson logsDecoder
            , timeout = Nothing
            , withCredentials = False
            }
            |> RemoteData.sendRequest
            |> Cmd.map FetchedProductLogs


nameChangesDecoder : Decode.Decoder NameChange
nameChangesDecoder =
    Decode.succeed NameChange
        |> optional "from" string ""
        |> optional "to" string ""


priceChangesDecoder : Decode.Decoder PriceChange
priceChangesDecoder =
    Decode.succeed PriceChange
        |> optional "from" float 0.0
        |> optional "to" float 0.0


stockChangesDecoder : Decode.Decoder StockChange
stockChangesDecoder =
    Decode.succeed StockChange
        |> optional "from" float 0.0
        |> optional "to" float 0.0


logDecoder : Decode.Decoder Log
logDecoder =
    Decode.succeed Log
        |> required "id" (string |> Decode.map ProductLogId)
        |> required "can_destroy" bool
        |> required "created_at" Utils.Date.decoder
        |> required "foreign_code" string
        |> required "human_name" string
        |> optional "name_changes" nameChangesDecoder (NameChange "" "")
        |> optional "price_changes" priceChangesDecoder (PriceChange 0.0 0.0)
        |> optional "stock_changes" stockChangesDecoder (StockChange 0.0 0.0)


logsDecoder : Decode.Decoder (List Log)
logsDecoder =
    Decode.field "other_logs" (Decode.list logDecoder)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg m =
    case msg of
        FetchedProductLogs xs ->
            ( { m | logs = xs }, Cmd.none )

        DestroyProductLog prdLogId ->
            ( m, destroyProductLog m.flags.apiEndpoint m.flags.apiAuthToken m.productId prdLogId )

        DestroyedProductLog prdLogId (Result.Err err) ->
            ( m, Cmd.none )

        DestroyedProductLog prdLogId (Result.Ok _) ->
            let
                filterOut : WebData (List Log) -> WebData (List Log)
                filterOut webData =
                    case webData of
                        RemoteData.Success xs ->
                            List.filter (\l -> l.id /= prdLogId) xs |> RemoteData.succeed

                        _ ->
                            webData
            in
                case m.logs of
                    RemoteData.Success _ ->
                        ( { m | logs = filterOut m.logs }, Cmd.none )

                    _ ->
                        ( m, Cmd.none )


viewLog : Log -> Html.Html Msg
viewLog log =
    let
        trashAttrsDefault : List (Html.Attribute Msg)
        trashAttrsDefault =
            [ class "btn btn-xs btn-danger"
            , onClick (DestroyProductLog log.id)
            ]

        trashAttrs : List (Html.Attribute Msg)
        trashAttrs =
            if log.canDestroy then
                trashAttrsDefault
            else
                (Html.Attributes.attribute "disabled" "true") :: trashAttrsDefault
    in
        tr []
            [ td [] [ text log.partnerName ]
            , td [] [ Utils.Date.toHuman log.createdAt |> text ]
            , td [] [ log.nameChange.from |> text ]
            , td [] [ log.nameChange.to |> text ]
            , td [] [ log.priceChange.from |> toCurrency |> text ]
            , td [] [ log.priceChange.to |> toCurrency |> text ]
            , td [] [ log.stockChange.from |> toString |> text ]
            , td [] [ log.stockChange.to |> toString |> text ]
            , td [ class "center-item-text" ]
                [ Html.node "form-nav-buttons"
                    [ class "btn-group", Html.Attributes.attribute "data-template" "table" ]
                    [ div trashAttrs
                        [ Html.i [ class "fa fa-trash-o" ] []
                        ]
                    ]
                ]
            ]


viewLogs : Model -> List (Html.Html Msg)
viewLogs m =
    case m.logs of
        RemoteData.Success logs ->
            List.map viewLog logs

        RemoteData.Failure err ->
            [ tr []
                [ td [] [ toString err |> text ]
                ]
            ]

        RemoteData.Loading ->
            [ tr []
                [ td [ colspan 9, class "text-center" ] [ text "Загружается" ]
                ]
            ]

        RemoteData.NotAsked ->
            [ text "Not asked" ]


view : Model -> Html.Html Msg
view m =
    div [ Html.Attributes.id "content" ]
        [ pageHeader "История товара"
        , div [ class "well well-white" ]
            [ Html.node "form-nav-buttons"
                []
                [ div [ class "btn-group" ]
                    [ div
                        [ class "btn btn-success"
                        ]
                        [ Html.i
                            [ class "fa fa-arrow-left"
                            ]
                            []
                        , text "К списку"
                        ]
                    , div
                        [ class "btn btn-success"
                        ]
                        [ Html.i
                            [ class "fa fa-search"
                            ]
                            []
                        , text "Смотреть"
                        ]
                    ]
                ]
            ]
        , div [ class "well well-white" ]
            [ Html.table [ class "table table-bordered hidden-xs" ]
                [ Html.thead []
                    [ tr []
                        [ th [] [ text "Партнёр" ]
                        , th [] [ text "Дата" ]
                        , th [ colspan 2 ] [ text "Название" ]
                        , th [ colspan 2 ] [ text "Цена" ]
                        , th [ colspan 2 ] [ text "Остаток" ]
                        , th [] []
                        ]
                    ]
                , Html.tbody [] (viewLogs m)
                ]
            ]
        ]


init : Flagz -> ( Model, Cmd Msg )
init flags =
    let
        initModel =
            Model RemoteData.Loading (initFlags flags) (ProductId flags.objId)
    in
        ( initModel
        , fetchProductLogs (Endpoint flags.apiEndpoint) (ApiAuthToken flags.authToken) flags.objId
        )


main : Program Flagz Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = (\m -> Sub.none)
        }
