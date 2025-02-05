package com.wtek.todoapp.security;

import lombok.extern.slf4j.Slf4j;
// Fournit automatiquement un logger nommé `log` via l'annotation @Slf4j

import org.aspectj.lang.ProceedingJoinPoint;
// Représente l’instant où la méthode interceptée (join point) est appelée et permet de l’exécuter (proceed)

import org.aspectj.lang.annotation.Around;
// Indique qu’on veut exécuter le code avant ET après la méthode ciblée (Around Advice)

import org.aspectj.lang.annotation.Aspect;
// Indique que cette classe est un Aspect (AOP : Aspect Oriented Programming)

import org.aspectj.lang.annotation.Pointcut;
// Permet de définir un pointcut, c’est-à-dire un ensemble de méthodes à intercepter

import org.springframework.security.core.context.SecurityContextHolder;
// Accède au contexte de sécurité Spring pour obtenir l’utilisateur connecté

import org.springframework.stereotype.Component;
// Marque la classe comme un composant Spring, pour qu’elle soit détectée et gérée par le conteneur

@Aspect
@Component
@Slf4j
public class SecurityLoggingAspect {

    /**
     * @Pointcut : on définit ici que le pointcut "controllerMethods"
     * concerne l’exécution de toute méthode dans le package
     * "com.wtek.todoapp.controller", peu importe la classe et les paramètres.
     */
    @Pointcut("execution(* com.wtek.todoapp.controller.*.*(..))")
    public void controllerMethods() {}

    /**
     * @Around("controllerMethods()") : on applique cet aspect autour
     * de toutes les méthodes identifiées par le pointcut "controllerMethods".
     * Cela signifie que logMethodAccess() sera invoquée avant ET après
     * l’appel réel de la méthode du contrôleur.
     */
    @Around("controllerMethods()")
    public Object logMethodAccess(ProceedingJoinPoint joinPoint) throws Throwable {

        // Récupère le nom d’utilisateur depuis le contexte de sécurité (Spring Security).
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // Récupère le nom de la méthode interceptée.
        String method = joinPoint.getSignature().getName();

        // On logge l'accès de l'utilisateur à la méthode en question.
        log.info("Utilisateur {} accède à {}", username, method);

        // On enregistre l'heure de début pour mesurer la durée de la méthode.
        long startTime = System.currentTimeMillis();

        try {
            // Exécute réellement la méthode interceptée (le "join point").
            Object result = joinPoint.proceed();

            // Calcule la durée d'exécution de la méthode.
            long duration = System.currentTimeMillis() - startTime;

            // Log d'information : durée de l’exécution de la méthode et utilisateur concerné.
            log.info("Exécution de {} par {} terminée en {}ms",
                    method, username, duration);

            // On retourne le résultat de la méthode initiale
            // pour ne pas briser le flux normal.
            return result;
        } catch (Exception e) {
            // Si une exception survient, on logge l'erreur,
            // puis on relance l’exception pour qu’elle soit gérée
            // par le mécanisme standard (Spring ou autre).
            log.error("Erreur lors de l'exécution de {} par {}: {}",
                    method, username, e.getMessage());
            throw e;
        }
    }
}
