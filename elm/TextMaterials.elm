module TextMaterials exposing (..)

import Date exposing (Date)
import Date.Format
import Html exposing (div, text, tr, td, th)
import Html.Attributes exposing (class, style)
import Html.Events exposing (onClick, onInput)
import Http
import Json.Decode as Decode exposing (field, int, string, float, bool)
import Json.Decode.Pipeline exposing (required)
import Json.Encode
import Utils.Date
import RemoteData exposing (WebData)
import Html.Texenergo exposing (pageHeader)
import Texenergo.Flags exposing (Flags, Flagz, Endpoint(..), ApiAuthToken(..))
import Texenergo.Ports exposing (setDat, setPicker)


type Msg
    = FetchedTextMaterials (WebData (List TextMaterial))
    | CreateTextMaterial
    | CreatedTextMaterial (Result Http.Error TextMaterial)
    | NewTextMaterialTitle String
    | NewTextMaterialDate String
    | FlipNewTextMaterial
    | RefreshTextMaterials
    | DestroyTextMaterial TextMaterialId
    | DestroyedTextMaterial TextMaterialId (Result Http.Error ())
    | ChangeFilter String
    | FilterKeyPressed Int


type TextMaterialId
    = TextMaterialId String


type alias TextMaterial =
    { id : TextMaterialId
    , title : String
    , date : Date
    }


type alias NewTextMaterial =
    { title : String
    , date : Date
    }


type Query
    = Query String


type alias Model =
    { flags : Flags
    , textMaterials : WebData (List TextMaterial)
    , newTextMaterialOpened : Bool
    , newTextMaterial : NewTextMaterial
    , query : Query
    }


destroyTextMaterials : Endpoint -> ApiAuthToken -> TextMaterialId -> Cmd Msg
destroyTextMaterials (Endpoint ep) (ApiAuthToken aat) (TextMaterialId q) =
    Http.request
        { method = "DELETE"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ aat)
            ]
        , url = ep ++ "/text_materials/" ++ q
        , body = Http.emptyBody
        , expect = Http.expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }
        |> Http.send (DestroyedTextMaterial (TextMaterialId q))


fetchTextMaterials : Endpoint -> ApiAuthToken -> Query -> Cmd Msg
fetchTextMaterials (Endpoint ep) (ApiAuthToken aat) (Query q) =
    let
        endpoint =
            ep
                ++ "/text_materials"
                ++ (if q /= "" then
                        ("?q=" ++ q)
                    else
                        ""
                   )
    in
        Http.request
            { method = "GET"
            , headers =
                [ Http.header "Authorization" ("Bearer " ++ aat)
                ]
            , url = endpoint
            , body = Http.emptyBody
            , expect = Http.expectJson textMaterialsDecoder
            , timeout = Nothing
            , withCredentials = False
            }
            |> RemoteData.sendRequest
            |> Cmd.map FetchedTextMaterials


encodeTextMaterial : NewTextMaterial -> Json.Encode.Value
encodeTextMaterial ntm =
    Json.Encode.object
        [ ( "title", Json.Encode.string ntm.title )
        , ( "date", Date.Format.formatISO8601 ntm.date |> Json.Encode.string )
        ]


textMaterialsDecoder : Decode.Decoder (List TextMaterial)
textMaterialsDecoder =
    Decode.list textMaterialDecoder


textMaterialDecoder : Decode.Decoder TextMaterial
textMaterialDecoder =
    Decode.succeed TextMaterial
        |> required "id" (string |> Decode.map TextMaterialId)
        |> required "title" string
        |> required "date" Utils.Date.decoder


update : Msg -> Model -> ( Model, Cmd Msg )
update msg m =
    let
        setDate : Date -> NewTextMaterial -> NewTextMaterial
        setDate str nit =
            { nit | date = str }

        setTitle : String -> NewTextMaterial -> NewTextMaterial
        setTitle str nit =
            { nit | title = str }
    in
        case msg of
            FlipNewTextMaterial ->
                ( { m | newTextMaterialOpened = not m.newTextMaterialOpened }, Cmd.none )

            RefreshTextMaterials ->
                ( { m | textMaterials = RemoteData.Loading }, fetchTextMaterials m.flags.apiEndpoint m.flags.apiAuthToken m.query )

            FetchedTextMaterials txts ->
                ( { m | textMaterials = txts }, Cmd.none )

            ChangeFilter str ->
                ( { m | query = Query str }, Cmd.none )

            FilterKeyPressed keyCode ->
                if keyCode == 13 then
                    ( { m | textMaterials = RemoteData.Loading }, fetchTextMaterials m.flags.apiEndpoint m.flags.apiAuthToken m.query )
                else
                    ( m, Cmd.none )

            NewTextMaterialTitle newTitle ->
                ( { m | newTextMaterial = (setTitle newTitle m.newTextMaterial) }, setPicker "Called picker" )

            NewTextMaterialDate newDate ->
                case Date.fromString newDate of
                    Ok x ->
                        ( { m | newTextMaterial = setDate x m.newTextMaterial }, Cmd.none )

                    Err _ ->
                        ( m, Cmd.none )

            CreateTextMaterial ->
                ( m, createTextMaterial m.flags.apiEndpoint m.flags.apiAuthToken m.newTextMaterial )

            CreatedTextMaterial (Result.Err err) ->
                ( m, Cmd.none )

            CreatedTextMaterial (Result.Ok x) ->
                ( { m | textMaterials = RemoteData.Loading }, fetchTextMaterials m.flags.apiEndpoint m.flags.apiAuthToken m.query )

            DestroyTextMaterial textMaterialId ->
                ( m, destroyTextMaterials m.flags.apiEndpoint m.flags.apiAuthToken textMaterialId )

            DestroyedTextMaterial textMaterialId (Result.Ok x) ->
                let
                    filterOut : WebData (List TextMaterial) -> WebData (List TextMaterial)
                    filterOut webData =
                        case webData of
                            RemoteData.Success xs ->
                                List.filter (\tm -> tm.id /= textMaterialId) xs |> RemoteData.succeed

                            _ ->
                                webData
                in
                    ( { m | textMaterials = filterOut m.textMaterials }, Cmd.none )

            DestroyedTextMaterial _ (Result.Err _) ->
                ( m, Cmd.none )


initNewTextMaterial : NewTextMaterial
initNewTextMaterial =
    NewTextMaterial "" (Date.fromTime 0.0)


init : Flagz -> ( Model, Cmd Msg )
init fs =
    let
        initModel : Model
        initModel =
            Model (Texenergo.Flags.initFlags fs) RemoteData.NotAsked False initNewTextMaterial (Query "")
    in
        ( initModel, fetchTextMaterials (Endpoint fs.apiEndpoint) (ApiAuthToken fs.authToken) (Query "") )


onKeyUp : (Int -> Msg) -> Html.Attribute Msg
onKeyUp tagger =
    Html.Events.on "keyup" (Decode.map tagger Html.Events.keyCode)


createTextMaterial : Endpoint -> ApiAuthToken -> NewTextMaterial -> Cmd Msg
createTextMaterial (Endpoint ep) (ApiAuthToken aat) ntm =
    Http.request
        { method = "POST"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ aat)
            ]
        , url = ep ++ "/text_materials"
        , body = Http.jsonBody (encodeTextMaterial ntm)
        , expect = Http.expectJson textMaterialDecoder
        , timeout = Nothing
        , withCredentials = False
        }
        |> Http.send CreatedTextMaterial


viewTextMaterial : TextMaterial -> Html.Html Msg
viewTextMaterial textMaterial =
    let
        textMaterialPath : TextMaterialId -> String
        textMaterialPath (TextMaterialId x) =
            "/#/texts/" ++ x
    in
        tr []
            [ td []
                [ text textMaterial.title
                ]
            , td [] [ Utils.Date.toHumanShort textMaterial.date |> text ]
            , td []
                [ Html.a [ class "btn btn-info", Html.Attributes.href <| textMaterialPath textMaterial.id ]
                    [ Html.i [ class "fa fa-eye" ] []
                    ]
                , div [ class "btn btn-danger", DestroyTextMaterial textMaterial.id |> onClick ]
                    [ Html.i [ class "fa fa-trash-o" ] []
                    ]
                ]
            ]


viewNewTextMaterial : Model -> Html.Html Msg
viewNewTextMaterial m =
    Html.span []
        [ Html.h4 []
            [ text "Создать текстовый материал"
            ]
        , Html.section [ class "form-group" ]
            [ Html.label [ class "control-label" ] [ text "Название" ]
            , Html.input
                [ class "input-sm form-control"
                , onInput NewTextMaterialTitle
                ]
                [ text m.newTextMaterial.title
                ]
            ]
        , Html.section [ class "form-group" ]
            [ Html.label [ class "control-label" ] [ text "Дата" ]
            , Html.input
                [ class "input-sm form-control"
                , Html.Attributes.id "datepicker"
                ]
                []
            , text "a"
            , text (toString m.newTextMaterial.date)
            , text "b"
            ]
        , Html.button
            [ class "btn btn-default"
            , onClick FlipNewTextMaterial
            ]
            [ text "Отмена"
            ]
        , Html.button
            [ class "btn btn-primary"
            , onClick CreateTextMaterial
            ]
            [ text "Сохранить"
            ]
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
            , onClick RefreshTextMaterials
            ]
            [ Html.i [ class "fa fa-search" ] []
            , text "Поиск"
            ]
        ]


view : Model -> Html.Html Msg
view m =
    div [ Html.Attributes.id "content" ]
        [ pageHeader "Текстовые Материалы"
        , div [ class "well well-white" ]
            [ Html.span [] []
            , Html.node "form-nav-buttons"
                []
                [ div [ class "btn-group" ]
                    [ div
                        [ class "btn btn-success"
                        , onClick FlipNewTextMaterial
                        ]
                        [ Html.i [ class "fa fa-plus" ] []
                        , text "Новый"
                        ]
                    , div
                        [ class "btn btn-success"
                        , onClick RefreshTextMaterials
                        ]
                        [ Html.i [ class "fa fa-refresh" ] []
                        , text "Обновить"
                        ]
                    ]
                ]
            , (if m.newTextMaterialOpened then
                viewNewTextMaterial m
               else
                viewQueryFilter m
              )
            , Html.hr [] []
            ]
        , div [ class "well well-white" ]
            [ Html.table [ class "table table-bordered hidden-xs" ]
                [ Html.thead []
                    [ tr []
                        [ th [] [ text "Название" ]
                        , th [] [ text "Дата" ]
                        , th [] []
                        ]
                    ]
                , Html.tbody []
                    (case m.textMaterials of
                        RemoteData.Success txts ->
                            (List.map viewTextMaterial txts)

                        RemoteData.NotAsked ->
                            [ text "Не запрошено" ]

                        RemoteData.Loading ->
                            [ text "Загружается" ]

                        RemoteData.Failure err ->
                            [ text ("Ошибка" ++ (toString err)) ]
                    )
                ]
            ]
        ]


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ setDat NewTextMaterialDate
        ]


main : Program Flagz Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
