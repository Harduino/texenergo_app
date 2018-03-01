module CustomerOrder exposing (..)

import Date exposing (Date)
import Html exposing (div, text, tr, td, th, p)
import Html.Attributes exposing (class, style)
import Http
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)
import Utils.Date
import RemoteData exposing (WebData)
import Contact.Model exposing (Contact, ContactId(..), initContact)
import Contact.Decoder exposing (contactDecoder)
import CustomerOrder.Model exposing (CustomerOrderId(..))
import DispatchOrder.Model exposing (DispatchOrder)
import DispatchOrder.Decoder exposing (dispatchOrderDecoder)
import Html.Texenergo exposing (pageHeader)
import Html.Texenergo.Button
import IncomingTransfer.Model exposing (IncomingTransfer, incomingTransferIdToString)
import IncomingTransfer.Decoder exposing (incomingTransferDecoder)
import Partner.Model exposing (Partner, PartnerId(..), initPartner)
import Partner.Decoder exposing (partnerDecoder, partnerIdToString)
import Product.Model exposing (Product)
import Product.Decoder exposing (productDecoder)
import Texenergo.Flags exposing (..)
import Utils.Currency


type CustomerOrderContentId
    = CustomerOrderContentId String


type alias Model =
    { customerOrder : WebData CustomerOrder
    , flags : Flags
    }


type alias Event =
    { action : String, name : String }


type alias CustomerOrderContent =
    { canDestroy : Bool
    , canEdit : Bool
    , cancellableQuantity : Int
    , comment : String
    , deliveryTerms : String
    , discount : Int
    , discountDescription : String
    , id : CustomerOrderContentId
    , price : Float
    , product : Product
    , quantity : Int
    , queryOriginal : String
    , remains : Int
    , stock : Int
    }


type alias CustomerOrder =
    { canConfirm : Bool
    , canDestroy : Bool
    , canEdit : Bool
    , customerOrderContents : List CustomerOrderContent
    , date : Date
    , description : String
    , dispatchOrders : List DispatchOrder
    , dispatchedAmount : Float
    , events : List Event
    , id : CustomerOrderId
    , incomingTransfers : List IncomingTransfer
    , issuedBy : Partner
    , managerName : String
    , number : String
    , paid_amount : Float
    , partner : Partner
    , payer : Partner

    -- , quotationOrders : List String
    , recipients : List Contact
    , status : String
    , title : String
    , total : Float
    }


type Msg
    = FetchCustomerOrder CustomerOrderId
    | FetchedCustomerOrder (WebData CustomerOrder)
    | RefreshCustomerOrder CustomerOrderId


update : Msg -> Model -> ( Model, Cmd Msg )
update msg m =
    let
        lala : String
        lala =
            "lulu"
    in
        case msg of
            FetchCustomerOrder customerOrderId ->
                ( m
                , fetchCustomerOrder m.flags.apiEndpoint m.flags.apiAuthToken customerOrderId
                )

            FetchedCustomerOrder custOrd ->
                ( { m | customerOrder = custOrd }, Cmd.none )

            RefreshCustomerOrder customerOrderId ->
                ( m
                , fetchCustomerOrder m.flags.apiEndpoint m.flags.apiAuthToken customerOrderId
                )


customerOrderContentDecoder : Decode.Decoder CustomerOrderContent
customerOrderContentDecoder =
    Decode.succeed CustomerOrderContent
        |> required "can_destroy" bool
        |> required "can_edit" bool
        |> required "cancellable_quantity" int
        |> required "comment" string
        |> required "delivery_terms" string
        |> required "discount" int
        |> required "discount_description" string
        |> required "id" (string |> Decode.map CustomerOrderContentId)
        |> required "price" float
        |> required "product" productDecoder
        |> required "quantity" int
        |> required "query_original" string
        |> required "remains" int
        |> required "stock" int


eventDecoder : Decode.Decoder Event
eventDecoder =
    Decode.succeed Event
        |> required "event" string
        |> required "name" string


customerOrderFullDecoder : Decode.Decoder CustomerOrder
customerOrderFullDecoder =
    Decode.succeed CustomerOrder
        |> required "can_confirm" bool
        |> required "can_destroy" bool
        |> required "can_edit" bool
        |> required "customer_order_contents" (Decode.list customerOrderContentDecoder)
        |> required "date" Utils.Date.decoder
        |> required "description" string
        |> required "dispatch_orders" (Decode.list dispatchOrderDecoder)
        |> required "dispatched_amount" float
        |> required "events" (Decode.list eventDecoder)
        |> required "id" (string |> Decode.map CustomerOrderId)
        |> required "incoming_transfers" (Decode.list incomingTransferDecoder)
        |> required "issued_by" partnerDecoder
        |> required "manager_name" string
        |> required "number" string
        |> required "paid_amount" float
        |> required "partner" partnerDecoder
        |> required "payer" partnerDecoder
        -- |> required "quotation_orders" (Decode.list string)
        |> required "recipients" (Decode.list contactDecoder)
        |> required "status" string
        |> required "title" string
        |> required "total" float


fetchCustomerOrder : Endpoint -> ApiAuthToken -> CustomerOrderId -> Cmd Msg
fetchCustomerOrder (Endpoint aep) (ApiAuthToken at) (CustomerOrderId coid) =
    let
        endpoint =
            aep ++ "/customer_orders/" ++ coid
    in
        Http.request
            { method = "GET"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ at)
                ]
            , url = endpoint
            , body = Http.emptyBody
            , expect = Http.expectJson customerOrderFullDecoder
            , timeout = Nothing
            , withCredentials = False
            }
            |> RemoteData.sendRequest
            |> Cmd.map FetchedCustomerOrder


init : Flagz -> ( Model, Cmd Msg )
init flags =
    let
        initModel =
            Model RemoteData.Loading (initFlags flags)
    in
        ( initModel
        , fetchCustomerOrder (Endpoint flags.apiEndpoint) (ApiAuthToken flags.authToken) (CustomerOrderId flags.objId)
        )


viewDispatchOrder : DispatchOrder -> Html.Html Msg
viewDispatchOrder dispatchOrder =
    tr []
        [ td [] [ Html.a [] [ text dispatchOrder.number ] ]
        , td [] [ Utils.Date.toHumanShort dispatchOrder.date |> text ]
        , td [] [ Utils.Currency.toCurrency dispatchOrder.total |> text ]
        ]


viewIncomingTransfer : IncomingTransfer -> Html.Html Msg
viewIncomingTransfer incomingTransfer =
    tr []
        [ td []
            [ Html.a [ incomingTransferIdToString incomingTransfer.id |> (++) "/#/incoming_transfers/" |> Html.Attributes.href ]
                [ text incomingTransfer.number
                ]
            ]
        , td [] [ Utils.Date.toHumanShort incomingTransfer.date |> text ]
        , td [] [ Utils.Currency.toCurrency incomingTransfer.total |> text ]
        ]


viewDocumentsBlock : CustomerOrder -> Html.Html Msg
viewDocumentsBlock co =
    Html.span []
        [ Html.table [ class "table table-hover" ]
            [ Html.thead []
                [ tr []
                    [ th [] [ text "Номер документа" ]
                    , th [] [ text "Дата документа" ]
                    , th [] [ text "Сумма документа" ]
                    ]
                ]
            , Html.tbody []
                (List.append
                    (List.map viewDispatchOrder co.dispatchOrders)
                    [ tr []
                        [ td [] []
                        , td [] [ text "Итого, руб:" ]
                        , td [] [ text "000.00 руб" ]
                        ]
                    ]
                )
            ]
        , Html.table [ class "table table-hover" ]
            [ Html.thead []
                [ tr []
                    [ th [] [ text "Вх. номер" ]
                    , th [] [ text "Вх. дата" ]
                    , th [] [ text "Сумма документа" ]
                    ]
                ]
            , Html.tbody []
                (List.append
                    (List.map viewIncomingTransfer co.incomingTransfers)
                    [ tr []
                        [ td [] []
                        , td [] [ text "Итого, руб:" ]
                        , td [] [ text "000.00 руб" ]
                        ]
                    ]
                )
            ]
        ]


viewContent : Int -> CustomerOrderContent -> Html.Html Msg
viewContent i coc =
    let
        customerOrderContentTotal : CustomerOrderContent -> Float
        customerOrderContentTotal cocTmp =
            (toFloat cocTmp.quantity) * coc.price * (1.0 - (toFloat coc.discount) / 100)
    in
        tr []
            [ td [] [ i + 1 |> toString |> text ]
            , td [] [ text coc.product.name ]
            , td [] [ text coc.product.article ]
            , td [ class "text-right" ] [ Utils.Currency.toCurrency coc.price |> text ]
            , td [ class "text-right" ] [ toString coc.quantity |> text ]
            , td [ class "text-right" ] [ toString coc.discount |> text ]
            , td [ class "text-right" ] [ customerOrderContentTotal coc |> Utils.Currency.toCurrency |> text ]
            , td [] [ toString coc.remains |> text ]
            ]


viewContentsBlock : CustomerOrder -> Html.Html Msg
viewContentsBlock co =
    Html.table [ class "table table-hover table-bordered margin-top-10" ]
        [ Html.thead []
            [ tr []
                [ th [] []
                , th [] [ text "Наименование" ]
                , th [] [ text "Артикул" ]
                , th [ class "text-right" ] [ text "Цена" ]
                , th [ class "text-right" ] [ text "Кол-во" ]
                , th [ class "text-right" ] [ text "Скидка" ]
                , th [ class "text-right" ] [ text "Итого" ]
                , th [] [ text "Осталось отгрузить" ]
                ]
            ]
        , Html.tbody [] (List.indexedMap viewContent co.customerOrderContents)
        ]


viewMetaBlock : CustomerOrder -> Html.Html Msg
viewMetaBlock customerOrder =
    let
        avoidEmpty : String -> String
        avoidEmpty str =
            if str == "" then
                "Нет"
            else
                str
    in
        div [ class "row margin-top-10" ]
            [ p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Свой номер:" ]
            , p [ class "col-md-9 ng-binding" ] [ avoidEmpty customerOrder.title |> text ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Описание:" ]
            , p [ class "col-md-9 ng-binding" ] [ avoidEmpty customerOrder.description |> text ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Дата заказа:" ]
            , p [ class "col-md-9 ng-binding" ] [ Utils.Date.toHumanShort customerOrder.date |> text ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Продавец:" ]
            , p [ class "col-md-9 ng-binding" ] [ text customerOrder.issuedBy.name ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Покупатель:" ]
            , p [ class "col-md-9 ng-binding" ] [ text customerOrder.partner.name ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Плательщик:" ]
            , p [ class "col-md-9 ng-binding" ] [ text customerOrder.payer.name ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Статус:" ]
            , p [ class "col-md-9 ng-binding" ] [ text customerOrder.status ]
            , p [ class "col-xs-12 col-md-3 font-bold" ] [ text "Менеджер:" ]
            , p [ class "col-md-9 ng-binding" ] [ text customerOrder.managerName ]
            ]


viewCustomerOrder : WebData CustomerOrder -> Html.Html Msg
viewCustomerOrder wd =
    let
        pageHeaderTitle : CustomerOrder -> String
        pageHeaderTitle co =
            "Заказ клиента: " ++ co.number
    in
        case wd of
            RemoteData.Success customerOrder ->
                div [ Html.Attributes.id "content" ]
                    [ pageHeaderTitle customerOrder |> pageHeader
                    , div [ class "well well-white" ]
                        [ Html.node "form-nav-buttons"
                            []
                            [ div [ class "btn-group" ]
                                [ Html.Texenergo.Button.render "arrow-left" "К списку"
                                , Html.Texenergo.Button.render "repeat" "Пересчитать"
                                , Html.Texenergo.Button.render "book" "История"
                                , Html.Texenergo.Button.render "refresh" "Обновить"
                                , Html.Texenergo.Button.render "file-pdf-o" "Печатная форма"
                                ]
                            ]
                        ]
                    , div [ class "well well-white" ]
                        [ viewMetaBlock customerOrder
                        ]
                    , div [ class "well well-white" ]
                        [ viewContentsBlock customerOrder
                        ]
                    , div [ class "well well-white" ]
                        [ viewDocumentsBlock customerOrder
                        ]
                    ]

            RemoteData.Failure str ->
                toString str |> text

            RemoteData.Loading ->
                text "Загружается"

            _ ->
                text "Ошибка"


view : Model -> Html.Html Msg
view m =
    viewCustomerOrder m.customerOrder


main : Program Flagz Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = (\m -> Sub.none)
        }
