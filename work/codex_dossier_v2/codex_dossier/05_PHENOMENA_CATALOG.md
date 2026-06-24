# Catalogue des Phénomènes

Philosophie du référentiel

Un phénomène n'est pas une cause.
Un phénomène est un signal observable issu des données disponibles.
Un même phénomène peut avoir plusieurs explications possibles.
Le rôle du système est d'orienter l'investigation.
Le rôle du consultant est de comprendre la situation réelle.

GOV-01 — Concentration des validations
Famille

Gouvernance

Description

Une proportion importante des validations est réalisée par une même personne.

Le phénomène peut révéler une dépendance organisationnelle ou une concentration de la prise de décision.

Calcul
Validations réalisées par la personne la plus sollicitée
/
Nombre total de validations
Sources
Jira Workflow
Changelog
Commentaires
Mapping des rôles
Seuils

Information : > 30 %

Attention : > 50 %

Critique : > 70 %

Indices observables
même validateur récurrent
même personne mentionnée avant validation
validations regroupées sur une seule personne
Hypothèses possibles
expertise rare
surcharge des autres validateurs
manque de délégation
manque de confiance
organisation historique
Questions d'investigation
Pourquoi cette personne valide-t-elle autant ?
Existe-t-il d'autres validateurs ?
Que se passe-t-il lorsqu'elle est absente ?
Depuis quand cette situation existe-t-elle ?
Preuves attendues
tickets concernés
transitions concernées
commentaires concernés
GOV-02 — Validation hors rôle
Famille

Gouvernance

Description

Les validations observées sont réalisées par des personnes différentes de celles prévues dans le modèle théorique.

Calcul
Nombre de validations réalisées hors rôle
/
Nombre total de validations
Sources
Jira
Organigramme
Mapping des rôles
RACI
Seuils

Information : > 10 %

Attention : > 25 %

Critique : > 40 %

Indices observables
BA validant des Features
Architecte validant des User Stories métier
Manager validant du travail opérationnel
Hypothèses possibles
vacance de rôle
rôle mal compris
organisation pragmatique
surcharge
manque de compétences
Questions d'investigation
Pourquoi cette activité est-elle réalisée par ce rôle ?
Est-ce exceptionnel ou habituel ?
Le rôle prévu existe-t-il réellement ?
GOV-03 — Multiplication des validations
Famille

Gouvernance

Description

Un même objet traverse un nombre inhabituel d'étapes de validation.

Calcul
Nombre moyen de validations
par objet
Sources
Workflow
Changelog
Seuils

À calibrer selon le contexte.

Indices observables
nombreux passages en validation
workflow très long
nombreuses approbations successives
Hypothèses possibles
culture du contrôle
peur de l'erreur
gouvernance lourde
manque de confiance
Questions d'investigation
Toutes ces validations apportent-elles de la valeur ?
Lesquelles pourraient être supprimées ?
GOV-04 — Validation séquentielle
Famille

Gouvernance

Description

Les validations sont réalisées les unes après les autres au lieu d'être parallélisées.

Calcul
Temps total validation
/
Nombre de validateurs

Analyse du workflow.

Sources
Workflow
Changelog
Indices observables
PO
↓
PM
↓
Architecte
↓
Manager
Hypothèses possibles
gouvernance historique
culture hiérarchique
responsabilités mal définies
Questions d'investigation
Pourquoi les validations sont-elles séquentielles ?
Peuvent-elles être regroupées ?
GOV-05 — Escalade récurrente
Famille

Gouvernance

Description

Une proportion importante des sujets est remontée à un niveau supérieur de décision.

Calcul
Tickets escaladés
/
Tickets totaux
Sources
Commentaires
Mentions
Changelog
Workflow
Seuils

Information : > 10 %

Attention : > 20 %

Critique : > 30 %

Indices observables
nombreux tickets remontés
intervention fréquente management
blocages nécessitant arbitrage
Hypothèses possibles
manque d'autonomie
responsabilités floues
peur de décider
gouvernance complexe
Questions d'investigation
Pourquoi les équipes n'arbitrent-elles pas elles-mêmes ?
Les responsabilités sont-elles claires ?
GOV-06 — Décision retardée
Famille

Gouvernance

Description

Les décisions mettent du temps à être prises après identification du besoin.

Calcul
Date première demande
↓
Date décision observée
Sources
Commentaires
Changelog
Workflow
Indices observables
nombreux échanges
attente prolongée
multiples relances
Hypothèses possibles
surcharge
gouvernance complexe
manque d'informations
arbitrage difficile
Questions d'investigation
Qui doit décider ?
Qu'est-ce qui ralentit la décision ?
GOV-07 — Décision revisitée
Famille

Gouvernance

Description

Une décision prise est régulièrement remise en question.

Calcul
modifications de priorité
modifications de périmètre
modifications d'acceptance criteria
changements de direction
Sources
Changelog
Commentaires
Indices observables
nombreux retours arrière
changements fréquents
Hypothèses possibles
besoin mal compris
gouvernance instable
parties prenantes non alignées
Questions d'investigation
Pourquoi la décision est-elle régulièrement revisitée ?
Qui remet la décision en question ?


FLW-01 — Waiting élevé
Famille

Flux

Description

Une part importante du temps de traversée est passée en attente plutôt qu'en traitement actif.

Calcul
Temps Waiting
/
Lead Time
Sources
Workflow
Changelog
Seuils

Information : > 20 %

Attention : > 40 %

Critique : > 60 %

Hypothèses possibles
dépendances
validations lentes
surcharge
arbitrages tardifs
Questions
Qu'attend-on exactement ?
Qui attend quoi ?
Quelles sont les attentes les plus fréquentes ?
FLW-02 — WIP élevé
Famille

Flux

Description

Trop de sujets sont ouverts simultanément.

Calcul
Travaux en cours
/
Capacité équipe
Sources
Board
Workflow
Seuils

À calibrer selon la taille de l'équipe.

Hypothèses possibles
multitâche
interruptions fréquentes
priorités instables
manque de focus
Questions
Pourquoi autant de sujets ouverts ?
Les équipes terminent-elles avant de commencer autre chose ?
FLW-03 — Flux interrompu
Famille

Flux

Description

Les tickets subissent de nombreux changements d'état sans progression visible.

Calcul
Nombre transitions
/
Ticket
Sources
Changelog
Détection
nombreux allers-retours
passages répétés dans les mêmes colonnes
Hypothèses possibles
besoin instable
dépendances
qualité insuffisante
validation difficile
Questions
Pourquoi revient-on régulièrement en arrière ?
FLW-04 — Stories multi-sprints
Famille

Flux

Description

Les User Stories traversent plusieurs sprints avant d'être terminées.

Calcul
Stories multi-sprints
/
Stories terminées
Sources
Sprints
Changelog
Seuils

Information : > 10 %

Attention : > 20 %

Critique : > 30 %

Hypothèses possibles
découpage insuffisant
dépendances
capacité surestimée
interruptions
Questions
Pourquoi ces stories ne terminent-elles pas dans le sprint ?
FLW-05 — Rework élevé
Famille

Flux

Description

Le travail doit être repris ou corrigé fréquemment.

Détection
retours QA
retours validation
réouverture tickets
retours en développement
Sources
Workflow
Changelog
Hypothèses possibles
critères flous
qualité insuffisante
compréhension incomplète
Questions
Pourquoi le travail revient-il régulièrement ?
FLW-06 — Goulot d'étranglement
Famille

Flux

Description

Une étape concentre durablement le travail en attente.

Calcul
WIP colonne
/
WIP total
Sources
Workflow
Board
Détection

Accumulation anormale dans une colonne.

Hypothèses possibles
manque de capacité
expertise rare
validation lente
Questions
Pourquoi cette étape est-elle saturée ?
FLW-07 — Temps de traversée excessif
Famille

Flux

Description

Le Lead Time est significativement supérieur à la cible ou au SLA.

Calcul
Date fin
-
Date création
Sources
Jira
SLA
Hypothèses possibles
dépendances
attente
gouvernance lourde
Questions
Où le temps est-il réellement consommé ?
FLW-08 — Variabilité élevée
Famille

Flux

Description

Les temps de traversée varient fortement pour des objets similaires.

Calcul
Écart-type Lead Time
Sources
Jira
Hypothèses possibles
processus non maîtrisé
dépendances imprévisibles
gouvernance variable
Questions
Pourquoi certains tickets vont-ils beaucoup plus vite que d'autres ?
FLW-09 — Blocages récurrents
Famille

Flux

Description

Les tickets passent régulièrement dans des états de blocage.

Calcul
Tickets bloqués
/
Tickets totaux
Sources
Workflow
Champs bloqué
Commentaires
Hypothèses possibles
dépendances
arbitrages manquants
expertise rare
Questions
Quels sont les blocages les plus fréquents ?
FLW-10 — Travail abandonné
Famille

Flux

Description

Des tickets restent durablement ouverts sans activité.

Calcul
Dernière activité
↓
Aujourd'hui
Sources
Changelog
Commentaires
Seuils

À définir selon le contexte.

Hypothèses possibles
changement de priorité
backlog mal entretenu
sujet devenu obsolète
Questions
Pourquoi ce travail est-il toujours ouvert ?
Est-il encore utile ?

PRD-01 — Churn Sprint élevé
Famille

Prévisibilité

Description

Le périmètre du sprint change fortement après son démarrage.

Calcul
(Points ajoutés + Points retirés)
/
Points engagés
Sources
Sprint
Changelog
Historique backlog
Seuils

Information : > 10 %

Attention : > 20 %

Critique : > 30 %

Hypothèses possibles
urgence permanente
backlog insuffisamment préparé
gouvernance instable
dépendances découvertes tardivement
Questions
Pourquoi le périmètre change-t-il autant ?
Les changements sont-ils prévisibles ?
PRD-02 — Faible confiance des engagements
Famille

Prévisibilité

Description

L'équipe réalise régulièrement moins que ce qu'elle s'était engagée à faire.

Calcul
SP réalisés
/
SP engagés
Sources
Sprint
Velocity
Seuils

Information : < 90 %

Attention : < 80 %

Critique : < 70 %

Hypothèses possibles
sous-estimation
interruptions
dépendances
capacité mal connue
Questions
Pourquoi les engagements ne sont-ils pas tenus ?
PRD-03 — Variabilité des engagements
Famille

Prévisibilité

Description

Les engagements varient fortement d'un sprint à l'autre.

Calcul
Écart-type
des SP engagés
Sources
Historique Sprint
Hypothèses possibles
capacité instable
priorisation fluctuante
gouvernance instable
Questions
Pourquoi le volume engagé varie-t-il autant ?
PRD-04 — Sprint Goal non atteint
Famille

Prévisibilité

Description

Le Sprint Goal n'est pas atteint malgré la réalisation d'une partie du périmètre.

Détection
Sprint Goal déclaré
Sprint Goal non atteint
tickets terminés malgré tout
Sources
Sprint
Sprint Goal
Hypothèses possibles
mauvais découpage
mauvais alignement
priorité mal comprise
Questions
Le Sprint Goal reflète-t-il réellement l'objectif du sprint ?
PRD-05 — Sprint Goal absent
Famille

Prévisibilité

Description

Les sprints sont pilotés par la liste des tickets plutôt que par un objectif explicite.

Calcul
Sprints avec Goal
/
Total Sprints
Sources
Sprint
Hypothèses possibles
pilotage par activité
manque d'alignement
Scrum incomplet
Questions
Comment l'équipe sait-elle ce qui est prioritaire ?
PRD-06 — Scope PI instable
Famille

Prévisibilité

Description

Le périmètre du PI change fortement après le PI Planning.

Calcul
Features ajoutées + retirées
/
Features engagées
Sources
PI
Portfolio
Seuils

Information : > 10 %

Attention : > 20 %

Critique : > 30 %

Hypothèses possibles
portefeuille immature
arbitrages tardifs
gouvernance instable
Questions
Pourquoi le PI évolue-t-il autant ?
PRD-07 — Features systématiquement reportées
Famille

Prévisibilité

Description

Certaines Features traversent plusieurs PI avant d'être terminées.

Calcul
Features reportées
/
Features engagées
Sources
PI
Features
Hypothèses possibles
surestimation
dépendances
priorisation instable
Questions
Pourquoi ces Features sont-elles constamment reportées ?
PRD-08 — Prévision de capacité peu fiable
Famille

Prévisibilité

Description

La capacité annoncée diffère fortement de la capacité observée.

Calcul
Capacité réalisée
/
Capacité planifiée
Sources
PI Planning
Sprint Planning
Hypothèses possibles
absences non anticipées
multitâche
interruptions
Questions
Comment la capacité est-elle construite ?
PRD-09 — Découverte tardive de travail
Famille

Prévisibilité

Description

Une part importante du travail est créée après le démarrage du Sprint ou du PI.

Calcul
SP créés après démarrage
/
SP réalisés
Sources
Création tickets
Sprint
Hypothèses possibles
backlog peu préparé
dette cachée
imprévus fréquents
Questions
Pourquoi découvre-t-on autant de travail en cours de route ?
PRD-10 — Vélocité instable
Famille

Prévisibilité

Description

La quantité de travail réalisée varie fortement entre les sprints.

Calcul
Écart-type
de la vélocité
Sources
Historique Sprint
Hypothèses possibles
équipe instable
dépendances
flux non maîtrisé
Questions
Qu'est-ce qui explique les écarts de performance ?


Mesure & Pilotage

Cette famille vise à détecter :

incohérences de mesure
dérives des indicateurs
effets de bord des métriques
perte de représentativité
MET-01 — Ratio SP/JH instable
Famille

Mesure & Pilotage

Description

Le rapport entre Story Points et charge réelle varie fortement dans le temps.

Calcul
Story Points réalisés
/
Jours-Homme consommés

Calculé :

par sprint
par PI
par équipe
Sources
Jira
Worklogs
Estimations
Détection
variation importante du ratio
rupture brutale de tendance
Hypothèses possibles
renouvellement équipe
changement typologie travail
recalibrage estimations
dette technique
backlog différent
Questions d'investigation
Que s'est-il passé pendant cette période ?
La nature du travail a-t-elle changé ?
L'équipe a-t-elle changé ?
MET-02 — Story Points peu corrélés à l'effort
Description

Des tickets similaires présentent des Story Points très différents.

Hypothèses possibles
absence de référence commune
dérive des estimations
équipes utilisant des échelles différentes
MET-03 — Story Points peu utilisés
Description

Une partie importante du travail est réalisée sans estimation.

Calcul
Tickets sans SP
/
Tickets totaux
Hypothèses possibles
manque de discipline
urgence
dette technique
processus contourné
MET-04 — Répartition atypique des tailles
Description

La majorité des tickets est concentrée sur une seule taille.

Exemple :

80 %
des tickets = 3 points
Hypothèses possibles
estimation mécanique
avoidance du débat
référence unique devenue défaut
MET-05 — Écart estimation / réalisation
Description

Les tickets dépassent régulièrement la charge attendue.

Calcul
Temps réel
/
Temps estimé
Hypothèses possibles
besoin mal compris
dépendances cachées
dette technique
mauvaise calibration
MET-06 — Travail non mesuré
Description

Une part importante du travail ne transite pas par Jira.

Indices :

commentaires
incidents
réunions
tickets créés après coup
Hypothèses possibles
outil peu utilisé
shadow process
RUN important
MET-07 — KPI contradictoires

Celui-là me plaît beaucoup.

Description

Deux indicateurs racontent des histoires incompatibles.

Exemple :

Velocity stable

mais

Lead Time explose

ou

90 % de Features Done

mais

30 % des Stories terminées
Questions
Peut-on faire confiance aux indicateurs ?
Le board représente-t-il la réalité ?

Famille — Valeur & Produit
VAL-01 — Feature sans User Stories
Description

Une Feature existe mais aucun travail associé n'a été identifié.

Calcul
Features sans US
/
Features totales
Hypothèses possibles
préparation incomplète
backlog immature
Feature créée trop tôt
Questions
Comment cette Feature sera-t-elle réalisée ?
Le découpage a-t-il commencé ?
VAL-02 — User Stories sans Feature
Description

Des User Stories ne sont rattachées à aucune Feature.

Calcul
US sans parent
/
US totales
Hypothèses possibles
travail opportuniste
dette de portefeuille
gouvernance faible
Questions
Pourquoi ce travail est-il réalisé ?
Quelle valeur métier est recherchée ?
VAL-03 — Travail sans rattachement métier
Description

Une part significative du travail n'est reliée à aucun objectif métier identifiable.

Sources
Portfolio
Jira
Features
Hypothèses possibles
backlog mal structuré
dette organisationnelle
perte de visibilité
Questions
Qui porte ce besoin ?
Comment sa valeur est-elle évaluée ?
VAL-04 — Feature ancienne non livrée
Description

Une Feature reste ouverte très longtemps.

Calcul
Aujourd'hui
-
Date création Feature
Hypothèses possibles
dépendances
arbitrages permanents
faible priorité réelle
Questions
Pourquoi cette Feature est-elle toujours active ?
VAL-05 — Backlog dormant
Description

Des éléments restent longtemps sans activité.

Calcul
Dernière modification
↓
Aujourd'hui
Hypothèses possibles
backlog non entretenu
besoins obsolètes
VAL-06 — Faible proportion de travail métier
Calcul
Business Stories
/
Travail total
Hypothèses possibles
dette technique
phase de stabilisation
modernisation
VAL-07 — RUN dominant
Calcul
Bugs + Incidents
/
Travail total
Hypothèses possibles
qualité insuffisante
dette technique
système fragile
VAL-08 — Maintenance dominante
Calcul
Maintenance
/
Travail total
Questions
Quelle part reste disponible pour l'innovation ?
VAL-09 — Travail hors portefeuille
Description

Travail réalisé sans être présent dans le portefeuille officiel.

Hypothèses possibles
shadow backlog
urgences permanentes
VAL-10 — Valeur non explicitée
Description

Feature sans objectif, bénéfice ou indicateur de succès.

Questions
Pourquoi réalise-t-on cette Feature ?
Famille — Communication & Documentation
COM-01 — Documentation peu utilisée
Description

La documentation existe mais est rarement mise à jour ou référencée.

Sources
Confluence
Documents
Commentaires Jira
Hypothèses possibles
documentation obsolète
connaissance informelle
COM-02 — Questions récurrentes
Description

Les mêmes clarifications apparaissent régulièrement.

Détection

Analyse commentaires.

Hypothèses possibles
documentation insuffisante
onboarding difficile
COM-03 — Information concentrée
Description

Toujours les mêmes personnes sont sollicitées pour répondre.

Calcul
Questions adressées à une personne
/
Questions totales
Hypothèses possibles
expertise rare
documentation insuffisante
COM-04 — Clarifications tardives
Description

Des informations importantes apparaissent après le démarrage.

Détection

Commentaires modifiant fortement le besoin.

Hypothèses possibles
backlog immature
préparation insuffisante
COM-05 — Documentation incomplète
Calcul
Tickets incomplets
/
Tickets totaux

Critères :

description absente
AC absents
COM-06 — Décisions non documentées
Description

Une décision est visible mais sa justification est absente.

Hypothèses possibles
gouvernance implicite
communication orale
COM-07 — Connaissance implicite
Description

Le ticket seul ne permet pas de comprendre le travail.

Détection

Description minimale + nombreux commentaires.

COM-08 — Canaux parallèles
Description

L'information importante n'apparaît pas dans les outils officiels.

Indices
tickets créés après coup
commentaires faisant référence à des discussions externes
Famille — Robustesse & Résilience
ROB-01 — Bus Factor faible
Description

Une personne détient une part importante de la connaissance.

Calcul
Sujets critiques
portés par une seule personne
ROB-02 — Concentration du savoir
Description

Toujours les mêmes personnes interviennent sur les mêmes sujets.

ROB-03 — Concentration des validations

(Référence GOV-01)

ROB-04 — Concentration des incidents
Description

Toujours les mêmes personnes sont mobilisées.

Calcul
Incidents impliquant même personne
/
Incidents totaux
ROB-05 — Concentration du delivery
Description

Une faible proportion de l'équipe réalise la majorité du travail.

Calcul
SP réalisés par les 20 %
les plus actifs
ROB-06 — Concentration des décisions
Description

Les arbitrages reposent sur très peu d'acteurs.

ROB-07 — Absence de redondance
Description

Un rôle critique n'a aucun remplaçant identifié.

ROB-08 — Sensibilité aux absences
Description

Les délais augmentent fortement lorsqu'une personne est absente.

Sources
calendrier
lead time
incidents
ROB-09 — Dépendance à une équipe
Description

Une équipe concentre une part importante des dépendances.

ROB-10 — Dette organisationnelle
Description

Une demande simple nécessite un nombre important :

d'acteurs
de validations
de transferts
d'attentes
Hypothèses possibles
complexité organisationnelle
gouvernance historique
accumulation de couches de contrôle