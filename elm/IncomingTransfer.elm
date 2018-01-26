port module IncomingTransfer exposing (..)

import CustomerOrder.Model exposing (CustomerOrderBrief, customerOrderBriefDecoder)
import Date exposing (Date)
import Html exposing (div, text, tr, td, th, p)
import Html.Attributes exposing (class, style, id)
import Html.Events exposing (onInput, onClick)
import Html.Texenergo exposing (pageHeader)
import Http
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)
import Partner.Model exposing (Partner, PartnerConfig, partnerDecoder, initPartnerConf, initPartner)
import RemoteData exposing (WebData)
import Texenergo.Flags exposing (..)
import Utils.Date
import Utils.Currency exposing (toCurrency)


type Msg
    = FetchedIncomingTransfer (WebData IncomingTransfer)
    | FetchIncomingTransfer
    | RefreshIncomingTransfer
    | Dummy


type IncomingTransferId
    = IncomingTransferId String


type IncomingTransferNumber
    = IncomingTransferNumber String


type alias MoneyAssignment =
    { id : String, amount : Float, customerOrder : CustomerOrderBrief }


type alias IncomingTransfer =
    { id : IncomingTransferId
    , number : IncomingTransferNumber
    , description : String
    , partner : Partner
    , date : Date
    , total : Float
    , moneyAssignments : List MoneyAssignment
    }


type alias Model =
    { incomingTransfer : WebData IncomingTransfer
    , incomingTransferId : String
    , flags : Flags
    }


unassignedAmount : IncomingTransfer -> Float
unassignedAmount it =
    let
        assignedAmount : Float
        assignedAmount =
            List.foldr (\ma -> (+) ma.amount) 0 it.moneyAssignments
    in
        it.total - assignedAmount


moneyAssignmentDecoder : Decode.Decoder MoneyAssignment
moneyAssignmentDecoder =
    Decode.succeed MoneyAssignment
        |> required "id" string
        |> required "amount" float
        |> required "customer_order" customerOrderBriefDecoder


moneyAssignmentsDecoder : Decode.Decoder (List MoneyAssignment)
moneyAssignmentsDecoder =
    Decode.list moneyAssignmentDecoder


incomingTransferDecoder : Decode.Decoder IncomingTransfer
incomingTransferDecoder =
    Decode.succeed IncomingTransfer
        |> required "id" (string |> Decode.map IncomingTransferId)
        |> required "number" (string |> Decode.map IncomingTransferNumber)
        |> required "description" string
        |> required "partner" partnerDecoder
        |> required "date" Utils.Date.decoder
        |> required "amount" float
        |> required "money_to_orders" moneyAssignmentsDecoder


fetchIncomingTransfer : Endpoint -> IncomingTransferId -> ApiAuthToken -> Cmd Msg
fetchIncomingTransfer (Endpoint endpoint) (IncomingTransferId id) (ApiAuthToken apiAuthToken) =
    Http.request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ apiAuthToken)
            ]
        , url = (endpoint ++ "/incoming_transfers/" ++ id)
        , body = Http.emptyBody
        , expect = Http.expectJson incomingTransferDecoder
        , timeout = Nothing
        , withCredentials = False
        }
        |> RemoteData.sendRequest
        |> Cmd.map FetchedIncomingTransfer


viewMetaBlock : WebData IncomingTransfer -> Html.Html Msg
viewMetaBlock wd =
    let
        numberToText : IncomingTransferNumber -> Html.Html Msg
        numberToText (IncomingTransferNumber n) =
            text n
    in
        case wd of
            RemoteData.Success incomingTransfer ->
                div [ class "row margin-top-10" ]
                    [ p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Входящий номер:" ]
                    , p [ class "col-md-9 ng-binding" ] [ numberToText incomingTransfer.number ]
                    , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Партнёр:" ]
                    , p [ class "col-md-9 ng-binding" ]
                        [ Html.a [ "/#/partners/" ++ incomingTransfer.partner.id |> Html.Attributes.href ] [ text incomingTransfer.partner.name ]
                        ]
                    , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Входящая дата:" ]
                    , p [ class "col-md-9 ng-binding" ]
                        [ Utils.Date.toHuman incomingTransfer.date |> text
                        ]
                    , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Назчание:" ]
                    , p [ class "col-md-9 ng-binding" ] [ text incomingTransfer.description ]
                    ]

            RemoteData.Failure str ->
                toString str |> text

            RemoteData.Loading ->
                text "Загружается"

            _ ->
                text "Ошибка"


viewMoneyAssignment : MoneyAssignment -> Html.Html Msg
viewMoneyAssignment ma =
    tr []
        [ td [] [ text ma.customerOrder.number ]
        , td [] [ toCurrency ma.amount |> text ]
        ]


viewAssignedBlock : WebData IncomingTransfer -> Html.Html Msg
viewAssignedBlock wd =
    case wd of
        RemoteData.Success incomingTransfer ->
            Html.table [ class "table" ]
                [ Html.thead []
                    [ tr []
                        [ th [] [ text "Заказ клиента" ]
                        , th [] [ text "Сумма" ]
                        ]
                    ]
                , Html.tbody []
                    (List.append
                        (List.map viewMoneyAssignment incomingTransfer.moneyAssignments)
                        [ tr []
                            [ td [ class "text-right" ] [ text "Итого:" ]
                            , td [] [ toCurrency incomingTransfer.total |> text ]
                            ]
                        ]
                    )
                ]

        _ ->
            text "Ошибка"


view : Model -> Html.Html Msg
view m =
    let
        numberToString : IncomingTransferNumber -> String
        numberToString (IncomingTransferNumber n) =
            n

        pageHeaderTitle : String
        pageHeaderTitle =
            "Входящий платеж: "
                ++ (case m.incomingTransfer of
                        RemoteData.Success t ->
                            numberToString t.number

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
                            , Html.Attributes.href "/#/incoming_transfers"
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
                                [ class "fa fa-refresh"
                                , onClick RefreshIncomingTransfer
                                ]
                                []
                            , text "Обновить"
                            ]
                        ]
                    ]
                ]
            , div [ class "well well-white" ]
                [ viewMetaBlock m.incomingTransfer
                ]
            , div [ class "well well-white" ]
                [ viewAssignedBlock m.incomingTransfer ]
            ]


init : Flagz -> ( Model, Cmd Msg )
init flags =
    let
        initModel : Flagz -> Model
        initModel fs =
            Model RemoteData.Loading flags.objId (initFlags fs)
    in
        ( initModel flags
        , fetchIncomingTransfer (Endpoint flags.apiEndpoint) (IncomingTransferId flags.objId) (ApiAuthToken flags.authToken)
        )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg m =
    case msg of
        RefreshIncomingTransfer ->
            ( { m | incomingTransfer = RemoteData.Loading }
            , fetchIncomingTransfer m.flags.apiEndpoint (IncomingTransferId m.incomingTransferId) m.flags.apiAuthToken
            )

        FetchedIncomingTransfer response ->
            ( { m | incomingTransfer = response }, Cmd.none )

        _ ->
            ( m, Cmd.none )


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
