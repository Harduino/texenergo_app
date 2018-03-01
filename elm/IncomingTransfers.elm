port module IncomingTransfers exposing (..)

import Date exposing (Date)
import Html exposing (div, text, tr, td, th)
import Html.Attributes exposing (class, style)
import Html.Events exposing (onClick, onInput)
import Http
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)
import Json.Encode
import Utils.Date
import Html.Texenergo exposing (pageHeader)
import Partner.Model exposing (Partner, PartnerId(..), PartnerConfig, initPartner, initPartnerConf)
import Partner.Decoder exposing (partnerDecoder, partnerIdToString)
import Utils.Currency exposing (toCurrency)


type Msg
    = FetchIncomingTransfers
    | FetchedIncomingTransfers (Result Http.Error (List IncomingTransfer))
    | LoadMoreIncomingTransfers
    | RefreshIncomingTransfers
    | ChangeFilter String
    | FilterKeyPressed Int
    | FlipNewIncomingTransfer
    | NewIncomingTransferField NewIncomingTransferFields String
    | CreateIncomingTransfer
    | ChoosePartner Partner
    | ChangePartnerFilter String
    | FetchedPartners (Result Http.Error (List Partner))
    | FlipEditingPartner
    | DateChosen String
    | CreatedIncomingTransfer (Result Http.Error IncomingTransfer)


type NewIncomingTransferFields
    = Number
    | ITDate
    | Description
    | Amount


type alias Flags =
    { authToken : String
    , apiEndpoint : String
    }


type alias IncomingTransfer =
    { id : String
    , number : String
    , total : Float
    , partner : Partner
    , date : Date
    , remainingAmount : Float
    }


type alias NewIncomingTransfer =
    { number : String
    , description : String
    , date : String --Date
    , amount : Float
    , partner : Partner
    }


type alias Model =
    { flags : Flags
    , incomingTransfers : List IncomingTransfer
    , page : Int
    , lastPage : Bool
    , filter : String
    , newIncomingTransferOpened : Bool
    , newIncomingTransfer : NewIncomingTransfer
    , partnerConf : PartnerConfig
    }


fetchIncomingTransfers : Model -> Int -> String -> Cmd Msg
fetchIncomingTransfers m p f =
    let
        queryString =
            "?q=" ++ f ++ "&page=" ++ (toString p)

        endpoint =
            m.flags.apiEndpoint ++ "/incoming_transfers" ++ queryString
    in
        Http.request
            { method = "GET"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ m.flags.authToken)
                ]
            , url = endpoint
            , body = Http.emptyBody
            , expect = Http.expectJson incomingTransfersDecoder
            , timeout = Nothing
            , withCredentials = False
            }
            |> Http.send FetchedIncomingTransfers


fetchPartners : Model -> String -> Cmd Msg
fetchPartners m f =
    let
        endpoint =
            (m.flags.apiEndpoint ++ "/partners?q=" ++ f)
    in
        Http.request
            { method = "GET"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ m.flags.authToken)
                ]
            , url = endpoint
            , body = Http.emptyBody
            , expect = Http.expectJson (Decode.list partnerDecoder)
            , timeout = Nothing
            , withCredentials = False
            }
            |> Http.send FetchedPartners


encodeCustomerOrder : NewIncomingTransfer -> Json.Encode.Value
encodeCustomerOrder no =
    Json.Encode.object
        [ ( "number", Json.Encode.string no.number )
        , ( "description", Json.Encode.string no.description )
        , ( "date", Json.Encode.string no.date )
        , ( "amount", Json.Encode.float no.amount )
        , ( "partner_id", partnerIdToString no.partner.id |> Json.Encode.string )
        ]


incomingTransfersDecoder : Decode.Decoder (List IncomingTransfer)
incomingTransfersDecoder =
    Decode.list incomingTransferDecoder


incomingTransferDecoder : Decode.Decoder IncomingTransfer
incomingTransferDecoder =
    Decode.succeed IncomingTransfer
        |> required "id" string
        |> required "number" string
        |> required "amount" float
        |> required "partner" partnerDecoder
        |> required "date" Utils.Date.decoder
        |> required "remaining_amount" float


update : Msg -> Model -> ( Model, Cmd Msg )
update msg m =
    let
        isLastPage : List IncomingTransfer -> Bool
        isLastPage xs =
            (List.length xs) < 25

        setNumber : String -> NewIncomingTransfer -> NewIncomingTransfer
        setNumber str nit =
            { nit | number = str }

        setDescription : String -> NewIncomingTransfer -> NewIncomingTransfer
        setDescription str nit =
            { nit | description = str }

        setAmount : Float -> NewIncomingTransfer -> NewIncomingTransfer
        setAmount flt nit =
            { nit | amount = flt }

        setPartner : Partner -> NewIncomingTransfer -> NewIncomingTransfer
        setPartner p nit =
            { nit | partner = p }

        setDate : String -> NewIncomingTransfer -> NewIncomingTransfer
        setDate str nit =
            { nit | date = str }

        --Date.fromString str}
        flipPartnerConf : PartnerConfig -> PartnerConfig
        flipPartnerConf pc =
            { pc | editing = not pc.editing }

        setPartnerFilter : String -> PartnerConfig -> PartnerConfig
        setPartnerFilter str pc =
            { pc | query = str }

        setPartnerList : List Partner -> PartnerConfig -> PartnerConfig
        setPartnerList lst pc =
            { pc | partners = lst }
    in
        case msg of
            FetchIncomingTransfers ->
                ( m, Cmd.none )

            FetchedIncomingTransfers (Result.Ok xs) ->
                ( { m | incomingTransfers = List.append m.incomingTransfers xs, lastPage = isLastPage xs }, Cmd.none )

            FetchedIncomingTransfers (Result.Err _) ->
                ( m, Cmd.none )

            RefreshIncomingTransfers ->
                ( { m | incomingTransfers = [], page = 1 }, fetchIncomingTransfers m 1 m.filter )

            LoadMoreIncomingTransfers ->
                if m.lastPage then
                    ( m, Cmd.none )
                else
                    ( { m | page = (m.page + 1) }, fetchIncomingTransfers m (m.page + 1) m.filter )

            ChangeFilter str ->
                ( { m | filter = str }, Cmd.none )

            FilterKeyPressed keyCode ->
                if keyCode == 13 then
                    ( { m | incomingTransfers = [], page = 1 }, fetchIncomingTransfers m 1 m.filter )
                else
                    ( m, Cmd.none )

            FlipNewIncomingTransfer ->
                ( { m | newIncomingTransferOpened = not m.newIncomingTransferOpened }, Cmd.none )

            CreateIncomingTransfer ->
                ( m, createIncomingTransfer m )

            NewIncomingTransferField f v ->
                case f of
                    Amount ->
                        case String.toFloat v of
                            Ok goodFloat ->
                                ( { m | newIncomingTransfer = (setAmount goodFloat m.newIncomingTransfer) }, Cmd.none )

                            Err _ ->
                                ( { m | newIncomingTransfer = (setAmount 0 m.newIncomingTransfer) }, Cmd.none )

                    Number ->
                        ( { m | newIncomingTransfer = (setNumber v m.newIncomingTransfer) }, setPicker "Called picker" )

                    ITDate ->
                        ( m, Cmd.none )

                    Description ->
                        ( { m | newIncomingTransfer = (setDescription v m.newIncomingTransfer) }, Cmd.none )

            ChoosePartner partner ->
                ( { m | newIncomingTransfer = setPartner partner m.newIncomingTransfer, partnerConf = (flipPartnerConf m.partnerConf) }, Cmd.none )

            ChangePartnerFilter str ->
                ( { m | partnerConf = (setPartnerFilter str m.partnerConf) }
                , if String.length str >= 2 then
                    fetchPartners m str
                  else
                    Cmd.none
                )

            FlipEditingPartner ->
                ( { m | partnerConf = (flipPartnerConf m.partnerConf) }, Cmd.none )

            FetchedPartners (Result.Ok partners) ->
                ( { m | partnerConf = (setPartnerList partners m.partnerConf) }, Cmd.none )

            FetchedPartners (Result.Err err) ->
                case err of
                    Http.BadPayload y z ->
                        Debug.log ("Http.BadPayload " ++ y)
                            ( m, Cmd.none )

                    _ ->
                        ( m, Cmd.none )

            DateChosen d ->
                ( { m | newIncomingTransfer = setDate d m.newIncomingTransfer }, Cmd.none )

            CreatedIncomingTransfer (Result.Err err) ->
                case err of
                    Http.BadPayload y z ->
                        ( m, Cmd.none )

                    _ ->
                        ( m, Cmd.none )

            CreatedIncomingTransfer (Result.Ok x) ->
                ( { m | incomingTransfers = [], page = 1, newIncomingTransfer = initNewIncomingTransfer }, fetchIncomingTransfers m 1 m.filter )


initNewIncomingTransfer : NewIncomingTransfer
initNewIncomingTransfer =
    NewIncomingTransfer "" "" "" 0 initPartner


init : Flags -> ( Model, Cmd Msg )
init fs =
    let
        initModel : Model
        initModel =
            Model fs [] 1 False "" False initNewIncomingTransfer initPartnerConf
    in
        ( initModel, fetchIncomingTransfers initModel 1 "" )


onKeyUp : (Int -> Msg) -> Html.Attribute Msg
onKeyUp tagger =
    Html.Events.on "keyup" (Decode.map tagger Html.Events.keyCode)


createIncomingTransfer : Model -> Cmd Msg
createIncomingTransfer m =
    let
        nco =
            m.newIncomingTransfer
    in
        Http.request
            { method = "POST"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ m.flags.authToken)
                ]
            , url = m.flags.apiEndpoint ++ "/incoming_transfers"
            , body = Http.jsonBody (encodeCustomerOrder nco)
            , expect = Http.expectJson incomingTransferDecoder
            , timeout = Nothing
            , withCredentials = False
            }
            |> Http.send CreatedIncomingTransfer


viewIncomingTransfer : IncomingTransfer -> Html.Html Msg
viewIncomingTransfer it =
    tr []
        [ td []
            [ Html.a [ Html.Attributes.href ("/#/incoming_transfers/" ++ it.id) ]
                [ text it.number
                ]
            ]
        , td [] [ Utils.Date.toHumanShort it.date |> text ]
        , td [ class "text-right" ] [ toCurrency it.total |> text ]
        , td [ class "text-right" ] [ toCurrency it.remainingAmount |> text ]
        , td [] [ text it.partner.name ]
        , td [ class "center-item-text" ]
            [ Html.node "form-nav-buttons"
                [ class "btn-group", Html.Attributes.attribute "data-template" "table" ]
                [ Html.a [ class "btn btn-xs btn-info", Html.Attributes.href ("/#/incoming_transfers/" ++ it.id) ]
                    [ Html.i [ class "fa fa-eye" ] []
                    ]
                ]
            ]
        ]


viewIncomingTransferMobile : IncomingTransfer -> Html.Html Msg
viewIncomingTransferMobile it =
    div
        [ class "col-xs-12"
        , style [ ( "margin-bottom", "10px" ), ( "border-bottom", "1px solid" ), ( "padding-bottom", "10px" ) ]
        ]
        [ div []
            [ text "Номер: "
            , Html.a [ Html.Attributes.href ("/#/incoming_transfers/" ++ it.id) ] [ text it.number ]
            ]
        , div [] [ ("Дата: " ++ Utils.Date.toHuman it.date) |> text ]
        , div [] [ "Сумма: " ++ toCurrency it.total |> text ]
        , div [] [ "Свободно: " ++ toCurrency it.remainingAmount |> text ]
        , div [] [ "Партнёр: " ++ it.partner.name |> text ]
        ]


viewQueryFilter : Model -> Html.Html Msg
viewQueryFilter m =
    Html.span []
        [ Html.hr [] []
        , div [ class "smart-form col-xs-12 col-md-6 col-lg-5 no-padding" ]
            [ Html.node "section"
                []
                [ Html.label [ class "label" ]
                    [ text "Запрос"
                    ]
                , Html.label [ class "input" ]
                    [ Html.input
                        [ Html.Attributes.type_ "text"
                        , Html.Attributes.placeholder "Введите часть номера"
                        , class "input-sm"
                        , Html.Events.onInput ChangeFilter
                        , onKeyUp FilterKeyPressed
                        ]
                        []
                    ]
                ]
            ]
        , Html.button
            [ class "btn btn-primary un-float margin-bottom-10"
            , onClick RefreshIncomingTransfers
            ]
            [ Html.i [ class "fa fa-search" ] []
            , text "Поиск"
            ]
        ]


viewPartnerOption : Partner -> Html.Html Msg
viewPartnerOption p =
    div
        [ class "col-md-2"
        ]
        [ Html.span [ onClick (ChoosePartner p), class "editable-click" ] [ String.left 20 p.name |> text ]
        ]


viewPartnerSection : Model -> Html.Html Msg
viewPartnerSection m =
    Html.section [ class "form-group", style [ ( "overflow-y", "auto" ) ] ]
        [ Html.label [ class "control-label" ] [ text "Партнёр" ]
        , Html.br [] []
        , if m.partnerConf.editing then
            Html.span []
                [ Html.input
                    [ class "input-sm form-control"
                    , onInput ChangePartnerFilter
                    , Html.Attributes.placeholder "Введите ИНН или префикс"
                    ]
                    [ text m.newIncomingTransfer.partner.name
                    ]
                , Html.span [] (List.map viewPartnerOption m.partnerConf.partners)
                ]
          else
            Html.span [ onClick FlipEditingPartner, class "editable-click" ]
                [ if String.length m.newIncomingTransfer.partner.name == 0 then
                    "Изменить" |> text
                  else
                    m.newIncomingTransfer.partner.name |> text
                ]
        ]


viewNewIncomingTransfer : Model -> Html.Html Msg
viewNewIncomingTransfer m =
    Html.span []
        [ Html.h4 []
            [ text "Создать новый платёж"
            ]
        , Html.section [ class "form-group" ]
            [ Html.label [ class "control-label" ] [ text "Код поступления" ]
            , Html.input
                [ class "input-sm form-control"
                , onInput (NewIncomingTransferField Number)
                ]
                [ text m.newIncomingTransfer.number
                ]
            ]
        , viewPartnerSection m
        , Html.section [ class "form-group" ]
            [ Html.label [ class "control-label" ] [ text "Дата поступления" ]
            , Html.input
                [ class "input-sm form-control"
                , Html.Attributes.id "datepicker"
                , onInput (NewIncomingTransferField ITDate)
                ]
                [ text m.newIncomingTransfer.description
                ]
            ]
        , Html.section [ class "form-group" ]
            [ Html.label [ class "control-label" ] [ text "Назначение" ]
            , Html.textarea
                [ class "input-sm form-control"
                , onInput (NewIncomingTransferField Description)
                ]
                [ text m.newIncomingTransfer.description
                ]
            ]
        , Html.section [ class "form-group" ]
            [ Html.label [ class "control-label" ] [ text "Сумма" ]
            , Html.input
                [ class "input-sm form-control"
                , onInput (NewIncomingTransferField Amount)
                ]
                [ m.newIncomingTransfer.amount |> toString |> text
                ]
            ]
        , Html.button
            [ class "btn btn-default"
            , onClick FlipNewIncomingTransfer
            ]
            [ text "Отмена"
            ]
        , Html.button
            [ class "btn btn-primary"
            , onClick CreateIncomingTransfer
            ]
            [ text "Сохранить"
            ]
        ]


view : Model -> Html.Html Msg
view m =
    div [ Html.Attributes.id "content" ]
        [ pageHeader "Входящие платежи"
        , div [ class "well well-white" ]
            [ Html.span [] []
            , Html.node "form-nav-buttons"
                []
                [ div [ class "btn-group" ]
                    [ div
                        [ class "btn btn-success"
                        , onClick FlipNewIncomingTransfer
                        ]
                        [ Html.i [ class "fa fa-plus" ] []
                        , text "Новый"
                        ]
                    , div
                        [ class "btn btn-success"
                        , onClick RefreshIncomingTransfers
                        ]
                        [ Html.i [ class "fa fa-refresh" ] []
                        , text "Обновить"
                        ]
                    ]
                ]
            , (if m.newIncomingTransferOpened then
                viewNewIncomingTransfer m
               else
                viewQueryFilter m
              )
            , Html.hr [] []
            ]
        , div [ class "well well-white" ]
            [ Html.table [ class "table table-bordered hidden-xs" ]
                [ Html.thead []
                    [ tr []
                        [ th [] [ text "Номер" ]
                        , th [] [ text "Дата" ]
                        , th [] [ text "Сумма" ]
                        , th [] [ text "Свободно" ]
                        , th [] [ text "Партнёр" ]
                        , th [] []
                        ]
                    ]
                , Html.tbody [] (List.map viewIncomingTransfer m.incomingTransfers)
                ]
            , div [ class "hidden-sm hidden-md hidden-lg", style [ ( "overflow-y", "auto" ) ] ] (List.map viewIncomingTransferMobile m.incomingTransfers)
            , viewLoadMore m
            ]
        ]


viewLoadMore : Model -> Html.Html Msg
viewLoadMore m =
    if m.lastPage then
        Html.span [] []
    else
        div
            [ onClick LoadMoreIncomingTransfers
            , style [ ( "width", "100%" ), ( "text-align", "center" ) ]
            ]
            [ Html.span [ class "editable-click a.editable-click" ]
                [ text "Загрузить ещё"
                ]
            ]


port setDat : (String -> msg) -> Sub msg


port setPicker : String -> Cmd msg


subscriptions : Model -> Sub Msg
subscriptions model =
    --Sub.none
    setDat DateChosen


main : Program Flags Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
