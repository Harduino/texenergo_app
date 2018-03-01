port module IncomingTransfer exposing (..)

import Date exposing (Date)
import Html exposing (div, text, tr, td, th, p)
import Html.Attributes exposing (class, style, id)
import Html.Events exposing (onInput, onClick)
import Http
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)
import Json.Encode
import RemoteData exposing (WebData)
import Utils.Date
import Utils.Currency exposing (toCurrency)
import CustomerOrder.Model exposing (CustomerOrderBrief, CustomerOrder, customerOrderBriefDecoder, customerOrdersDecoder, customerOrderIdToString)
import Html.Texenergo exposing (pageHeader)
import Partner.Model exposing (Partner, PartnerId(..), initPartner)
import Partner.Decoder exposing (partnerDecoder, partnerIdToString)
import Texenergo.Flags exposing (..)


type Msg
    = FetchedIncomingTransfer (WebData IncomingTransfer)
    | FetchIncomingTransfer
    | RefreshIncomingTransfer
    | FetchedCustomerOrders (WebData (List CustomerOrder))
    | FilterKeyPressed CustomerOrderRow Int
    | ChangeCustomerOrderAmount CustomerOrderRow String
    | CreatedMoneyAssign (Result Http.Error String)



-- | FetchedOutgoingTransfers (WebData OutgoingTransferBrief)


type IncomingTransferId
    = IncomingTransferId String


type IncomingTransferNumber
    = IncomingTransferNumber String


type MoneyAssignmentId
    = MoneyAssignmentId String


type alias CustomerOrderRow =
    { amountAssigned : Float
    , obj : CustomerOrder
    }


type alias MoneyAssignment =
    { id : MoneyAssignmentId, amount : Float, customerOrder : CustomerOrderBrief }


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
    , customerOrders : List CustomerOrderRow
    }


onKeyUp : (Int -> Msg) -> Html.Attribute Msg
onKeyUp tagger =
    Html.Events.on "keyup" (Decode.map tagger Html.Events.keyCode)


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
        |> required "id" (string |> Decode.map MoneyAssignmentId)
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


encodeMoneyAssignment : CustomerOrderRow -> Json.Encode.Value
encodeMoneyAssignment cor =
    Json.Encode.object
        [ ( "amount", Json.Encode.float cor.amountAssigned )
        , ( "customer_order_id", Json.Encode.string cor.obj.id )
        ]


createMoneyAssignment : IncomingTransferId -> ApiAuthToken -> Endpoint -> CustomerOrderRow -> Cmd Msg
createMoneyAssignment (IncomingTransferId itid) (ApiAuthToken aat) (Endpoint aep) cor =
    Http.request
        { method = "POST"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ aat)
            ]
        , url = aep ++ "/incoming_transfers/" ++ itid ++ "/money_to_orders"
        , body = Http.jsonBody (encodeMoneyAssignment cor)
        , expect = Http.expectJson (Decode.succeed "")
        , timeout = Nothing
        , withCredentials = False
        }
        |> Http.send CreatedMoneyAssign


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


fetchCustomerOrders : Endpoint -> ApiAuthToken -> PartnerId -> Cmd Msg
fetchCustomerOrders (Endpoint aep) (ApiAuthToken at) (PartnerId pid) =
    let
        queryString =
            "?partner_id=" ++ pid

        endpoint =
            aep ++ "/customer_orders" ++ queryString
    in
        Http.request
            { method = "GET"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ at)
                ]
            , url = endpoint
            , body = Http.emptyBody
            , expect = Http.expectJson customerOrdersDecoder
            , timeout = Nothing
            , withCredentials = False
            }
            |> RemoteData.sendRequest
            |> Cmd.map FetchedCustomerOrders


viewMetaBlock : WebData IncomingTransfer -> Html.Html Msg
viewMetaBlock wd =
    let
        numberToText : IncomingTransferNumber -> Html.Html Msg
        numberToText (IncomingTransferNumber n) =
            text n

        extractPartnerId : PartnerId -> String
        extractPartnerId (PartnerId str) =
            str
    in
        case wd of
            RemoteData.Success incomingTransfer ->
                div [ class "row margin-top-10" ]
                    [ p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Входящий номер:" ]
                    , p [ class "col-md-9 ng-binding" ] [ numberToText incomingTransfer.number ]
                    , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Партнёр:" ]
                    , p [ class "col-md-9 ng-binding" ]
                        [ Html.a [ "/#/partners/" ++ (incomingTransfer.partner.id |> extractPartnerId) |> Html.Attributes.href ] [ text incomingTransfer.partner.name ]
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
        [ td []
            [ Html.a [ "/#/customer_orders/" ++ (customerOrderIdToString ma.customerOrder.id) |> Html.Attributes.href ] [ text ma.customerOrder.number ]
            ]
        , td [] [ toCurrency ma.amount |> text ]
        ]


viewCustomerOrder : CustomerOrderRow -> Html.Html Msg
viewCustomerOrder customerOrderRow =
    let
        co : CustomerOrder
        co =
            customerOrderRow.obj

        localTotal : String
        localTotal =
            toCurrency co.total

        localAmountPaid : String
        localAmountPaid =
            toCurrency co.amountPaid
    in
        tr []
            [ td [] [ text co.number ]
            , td [] [ (localAmountPaid ++ " / " ++ localTotal) |> text ]
            , td []
                [ Html.label [ class "input" ]
                    [ Html.input
                        [ Html.Attributes.type_ "text"
                        , Html.Attributes.placeholder "Сумму повесить"
                        , customerOrderRow.amountAssigned |> toString |> Html.Attributes.value
                        , onInput (ChangeCustomerOrderAmount customerOrderRow)
                        , onKeyUp (FilterKeyPressed customerOrderRow)
                        ]
                        []
                    ]
                ]
            ]


viewCustomerOrders : Model -> IncomingTransfer -> Html.Html Msg
viewCustomerOrders m incomingTransfer =
    if unassignedAmount incomingTransfer > 0 then
        Html.span []
            [ Html.h1 [] [ unassignedAmount incomingTransfer |> toCurrency |> (++) "Доступно для развешивания: " |> text ]
            , Html.table [ class "table" ]
                [ Html.thead []
                    [ tr []
                        [ th [] [ text "Заказ клиента" ]
                        , th [] [ text "Оплачено / Сумма" ]
                        , th [] [ text "Назначить" ]
                        ]
                    ]
                , Html.tbody []
                    (List.append
                        (List.map viewCustomerOrder m.customerOrders)
                        [ tr []
                            [ td [ class "text-right", Html.Attributes.colspan 2 ] [ text "Итого:" ]
                            , td [] [ toCurrency incomingTransfer.total |> text ]
                            ]
                        ]
                    )
                ]
            ]
    else
        Html.span [] []


viewAssignedBlock : Model -> WebData IncomingTransfer -> Html.Html Msg
viewAssignedBlock m wd =
    case wd of
        RemoteData.Success incomingTransfer ->
            Html.span []
                [ viewCustomerOrders m incomingTransfer
                , Html.h1 [] [ text "Привязка денежных средств" ]
                , Html.table [ class "table" ]
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
                ]

        _ ->
            text "Ошибка"


view : Model -> Html.Html Msg
view m =
    let
        numberToString : IncomingTransferNumber -> String
        numberToString (IncomingTransferNumber n) =
            n

        extractNumber : WebData IncomingTransfer -> String
        extractNumber wd =
            case wd of
                RemoteData.Success t ->
                    numberToString t.number

                _ ->
                    "Ждём"

        pageHeaderTitle : String
        pageHeaderTitle =
            "Входящий платеж: " ++ (extractNumber m.incomingTransfer)
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
                            , onClick RefreshIncomingTransfer
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
                [ viewMetaBlock m.incomingTransfer
                ]
            , div [ class "well well-white" ]
                [ viewAssignedBlock m m.incomingTransfer ]
            ]


init : Flagz -> ( Model, Cmd Msg )
init flags =
    let
        initModel : Flagz -> Model
        initModel fs =
            Model RemoteData.Loading flags.objId (initFlags fs) []
    in
        ( initModel flags
        , fetchIncomingTransfer (Endpoint flags.apiEndpoint) (IncomingTransferId flags.objId) (ApiAuthToken flags.authToken)
        )


updateFetchedCustomerOrders : Model -> List CustomerOrder -> Model
updateFetchedCustomerOrders m orders =
    { m | customerOrders = List.map (CustomerOrderRow 0.0) orders }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg m =
    let
        afterIncomingTransferCommands : WebData IncomingTransfer -> Cmd Msg
        afterIncomingTransferCommands wd =
            case wd of
                RemoteData.Success tmpIncomingTransfer ->
                    fetchCustomerOrders m.flags.apiEndpoint m.flags.apiAuthToken tmpIncomingTransfer.partner.id

                _ ->
                    Cmd.none
    in
        case msg of
            RefreshIncomingTransfer ->
                ( { m | incomingTransfer = RemoteData.Loading }
                , fetchIncomingTransfer m.flags.apiEndpoint (IncomingTransferId m.incomingTransferId) m.flags.apiAuthToken
                )

            FetchedIncomingTransfer response ->
                ( { m | incomingTransfer = response }, afterIncomingTransferCommands response )

            FetchIncomingTransfer ->
                ( { m | incomingTransfer = RemoteData.Loading }, Cmd.none )

            FetchedCustomerOrders response ->
                case response of
                    RemoteData.Success orders ->
                        ( updateFetchedCustomerOrders m orders, Cmd.none )

                    _ ->
                        ( m, Cmd.none )

            FilterKeyPressed customerOrderRow keyCode ->
                if keyCode == 13 then
                    ( m, createMoneyAssignment (IncomingTransferId m.incomingTransferId) m.flags.apiAuthToken m.flags.apiEndpoint customerOrderRow )
                else
                    ( m, Cmd.none )

            ChangeCustomerOrderAmount customerOrderRow newAmount ->
                let
                    getUnassignedAmount : Float
                    getUnassignedAmount =
                        case m.incomingTransfer of
                            RemoteData.Success x ->
                                unassignedAmount x

                            _ ->
                                0.0

                    updateCustomerOrderAssigned : List CustomerOrderRow
                    updateCustomerOrderAssigned =
                        List.map
                            (\co ->
                                if co.obj.id == customerOrderRow.obj.id then
                                    case String.toFloat newAmount of
                                        Ok goodFloat ->
                                            { co
                                                | amountAssigned =
                                                    if goodFloat <= getUnassignedAmount then
                                                        goodFloat
                                                    else
                                                        getUnassignedAmount
                                            }

                                        Err _ ->
                                            co
                                else
                                    co
                            )
                            m.customerOrders
                in
                    ( { m | customerOrders = updateCustomerOrderAssigned }, Cmd.none )

            CreatedMoneyAssign _ ->
                ( m, fetchIncomingTransfer m.flags.apiEndpoint (IncomingTransferId m.incomingTransferId) m.flags.apiAuthToken )


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
