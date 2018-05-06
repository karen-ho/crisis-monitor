//
//  ViewController.swift
//  Nopioids
//
//  Created by Dan Kim on 5/5/18.
//  Copyright © 2018 Dan Kim. All rights reserved.
//

import Foundation
import UIKit
import MapboxCoreNavigation
import MapboxNavigation
import MapboxDirections

class ViewController: UIViewController, NavigationViewControllerDelegate {
    
    var modalView: ModalViewController?
    var viewController: NavigationViewController?
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    @IBAction func openInitModal(_ sender: UIButton) {
        let modalSb = UIStoryboard(name: "Modal", bundle: nil)
        modalView = modalSb.instantiateViewController(withIdentifier: "ModalView") as! ModalViewController
        present(modalView!, animated: true)
        modalView!.button.addTarget(self, action: #selector(startNavigation), for: .touchUpInside)
    }
    
    @objc func startNavigation(_ sender: UIButton) {
        self.modalView!.dismiss(animated: true, completion: nil)
        let origin = Waypoint(coordinate: CLLocationCoordinate2D(latitude: 36.109946, longitude: -115.175391), name: "Start")
        let destination = Waypoint(coordinate: CLLocationCoordinate2D(latitude: 36.107349, longitude: -115.176584), name: "Patient")
        
        let options = NavigationRouteOptions(waypoints: [origin, destination])
        
        Directions.shared.calculate(options) { (waypoints, routes, error) in
            guard let route = routes?.first else { return }
            
            self.viewController = NavigationViewController(for: route)
            self.viewController?.delegate = self
            self.viewController?.showsEndOfRouteFeedback = false
            let sim = SimulatedLocationManager(route: route)
            sim.speedMultiplier = 5
            self.viewController?.routeController.locationManager = sim
            self.present(self.viewController!, animated: false, completion: nil)
        }
    }
    
    func showModal() {
        DispatchQueue.main.async {
            self.present(self.modalView!, animated: true)
            self.modalView?.reqTime.text = "5m ago"
            self.modalView?.button.setTitle("Success!", for: .normal)
            self.modalView?.button.removeTarget(self, action: #selector(self.startNavigation), for: .touchUpInside)
            self.modalView?.button.addTarget(self, action: #selector(self.closeModal), for: .touchUpInside)
        }
    }
    
    @objc func closeModal(_ sender: UIButton) {
        self.modalView?.dismiss(animated: true, completion: nil)
    }
    
    func navigationViewController(_ navigationViewController: NavigationViewController, didArriveAt waypoint: Waypoint) -> Bool {
        viewController?.dismiss(animated: true, completion: {() in
            self.showModal()
        })
        
        return false
    }
}

