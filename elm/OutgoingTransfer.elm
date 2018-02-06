port module OutgoingTransfer exposing (..)

import Date exposing (Date)
import Html exposing (div, text, tr, td, th, p)
import Html.Attributes exposing (class, style, id)
import Html.Events exposing (onInput, onClick)
import Html.Texenergo exposing (pageHeader)
import Http
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)
import RemoteData exposing (WebData)
import Partner.Model exposing (Partner, PartnerConfig, partnerDecoder, initPartnerConf, initPartner, partnerIdToString)
import Texenergo.Flags exposing (..)
import Utils.Date
import Utils.Currency exposing (toCurrency)


type OutgoingTransferId
    = OutgoingTransferId String


type Msg
    = FetchedOutgoingTransfer (WebData OutgoingTransfer)
    | RefreshOutgoingTransfer


type PageNumber
    = PageNumber Int


type alias OutgoingTransfer =
    { id : OutgoingTransferId
    , number : String
    , description : String
    , partner : Partner
    , date : Date
    , total : Float
    }


type alias Model =
    { outgoingTransfer : WebData OutgoingTransfer
    , outgoingTransferId : String
    , flags : Flags
    }


outgoingTransferIdToString : OutgoingTransferId -> String
outgoingTransferIdToString (OutgoingTransferId n) =
    n


viewMetaBlock : WebData OutgoingTransfer -> Html.Html Msg
viewMetaBlock wd =
    case wd of
        RemoteData.Success outgoingTransfer ->
            div [ class "row margin-top-10" ]
                [ p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Входящий номер:" ]
                , p [ class "col-md-9 ng-binding" ] [ text outgoingTransfer.number ]
                , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Партнёр:" ]
                , p [ class "col-md-9 ng-binding" ]
                    [ Html.a [ "/#/partners/" ++ (partnerIdToString outgoingTransfer.partner.id) |> Html.Attributes.href ] [ text outgoingTransfer.partner.name ]
                    ]
                , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Входящая дата:" ]
                , p [ class "col-md-9 ng-binding" ]
                    [ Utils.Date.toHuman outgoingTransfer.date |> text
                    ]
                , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Назчание:" ]
                , p [ class "col-md-9 ng-binding" ] [ text outgoingTransfer.description ]
                ]

        _ ->
            text "Ошибка"


viewAssignedBlock : WebData OutgoingTransfer -> Html.Html Msg
viewAssignedBlock wd =
    case wd of
        RemoteData.Success outgoingTransfer ->
            Html.table [ class "table" ]
                [ Html.thead []
                    [ tr []
                        [ th [] [ text "Заказ клиента" ]
                        , th [] [ text "Сумма" ]
                        ]
                    ]
                , Html.tbody []
                    [ tr []
                        [ td [ class "text-right" ] [ text "Итого:" ]
                        , td [] [ toCurrency outgoingTransfer.total |> text ]
                        ]
                    ]
                ]

        _ ->
            text "Ошибка"


view : Model -> Html.Html Msg
view m =
    let
        pageHeaderTitle : String
        pageHeaderTitle =
            "Исходящий платеж: "
                ++ (case m.outgoingTransfer of
                        RemoteData.Success t ->
                            t.number

                        _ ->
                            "Ждём"
                   )
    in
        div [ id "content" ]
            [ pageHeaderTitle |> pageHeader
            , div [ class "well well-white" ]
                [ Html.node "form-nav-buttons"
                    []
                    [ div [ class "btn-group" ]
                        [ Html.a
                            [ class "btn btn-success"
                            , Html.Attributes.href "/#/outgoing_transfers"
                            ]
                            [ Html.i
                                [ class "fa fa-arrow-left"
                                ]
                                []
                            , text "К списку"
                            ]
                        , div
                            [ class "btn btn-success"
                            , onClick RefreshOutgoingTransfer
                            ]
                            [ Html.i
                                [ class "fa fa-refresh"
                                ]
                                []
                            , text "Обновить"
                            ]
                        ]
                    ]
                ]
            , div [ class "well well-white" ]
                [ viewMetaBlock m.outgoingTransfer
                ]
            , div [ class "well well-white" ]
                [ viewAssignedBlock m.outgoingTransfer ]
            ]


outgoingTransferDecoder : Decode.Decoder OutgoingTransfer
outgoingTransferDecoder =
    Decode.succeed OutgoingTransfer
        |> required "id" (string |> Decode.map OutgoingTransferId)
        |> required "number" string
        |> required "description" string
        |> required "partner" partnerDecoder
        |> required "date" Utils.Date.decoder
        |> required "amount" float


fetchOutgoingTransfer : Endpoint -> OutgoingTransferId -> ApiAuthToken -> Cmd Msg
fetchOutgoingTransfer (Endpoint endpoint) (OutgoingTransferId id) (ApiAuthToken apiAuthToken) =
    Http.request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ apiAuthToken)
            ]
        , url = (endpoint ++ "/outgoing_transfers/" ++ id)
        , body = Http.emptyBody
        , expect = Http.expectJson outgoingTransferDecoder
        , timeout = Nothing
        , withCredentials = False
        }
        |> RemoteData.sendRequest
        |> Cmd.map FetchedOutgoingTransfer


update : Msg -> Model -> ( Model, Cmd Msg )
update msg m =
    case msg of
        RefreshOutgoingTransfer ->
            ( m, fetchOutgoingTransfer m.flags.apiEndpoint (OutgoingTransferId m.outgoingTransferId) m.flags.apiAuthToken )

        FetchedOutgoingTransfer response ->
            ( { m | outgoingTransfer = response }, Cmd.none )


init : Flagz -> ( Model, Cmd Msg )
init fs =
    let
        initModel : Flagz -> Model
        initModel fs =
            Model RemoteData.Loading (fs.objId) (initFlags fs)
    in
        ( initModel fs
        , fetchOutgoingTransfer (Endpoint fs.apiEndpoint) (OutgoingTransferId fs.objId) (ApiAuthToken fs.authToken)
        )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


main : Program Flagz Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
