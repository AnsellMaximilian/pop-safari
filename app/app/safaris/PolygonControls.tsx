"use client";
import React, { useContext, useState } from "react";
import { SafariPageContext } from "./SafarisSection";
import Point, { GroundPoint } from "@/components/Point";
import { Button } from "@/components/ui/button";
import { createPolygon, generateValidId } from "@/lib/maps";
import {
  removeElementsWithClass,
  removeElementsWithSelector,
} from "@/utils/maps";
import { POLYGON_POINT } from "@/const/maps";
import { v4 as uuidv4 } from "uuid";
import { Slider } from "@/components/ui/slider";
import { FormLabel } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { config, databases } from "@/lib/appwrite";
import { ID, Permission, Role } from "appwrite";
import { SafariPolygon } from "@/type";
import { useUser } from "@/contexts/user/UserContext";
import { CollapsibleContext } from "@/components/CollapsibleController";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { hexToRGBA } from "@/utils/common";

export default function PolygonControls() {
  const {
    polygonPoints,
    setPolygonPoints,
    currentPolygonId,
    setCurrentPolygonId,
    currentPolygonPoints,
    setCurrentPolygonPoints,
    selectedSafari,
    safariPolygons,
    setSafariPolygons,
  } = useContext(SafariPageContext);
  const { currentUser } = useUser();
  const { map } = useContext(SafariPageContext);
  const { setOpen } = useContext(CollapsibleContext);
  const { toast } = useToast();

  const [altitude, setAltitude] = useState(25);
  const [strokeColor, setStrokeColor] = useState("#F97316");
  const [fillColor, setFillColor] = useState("#F97316");
  const [opacity, setOpacity] = useState(0.1);

  const [isCreating, setIsCreating] = useState(false);

  const handleSavePolygon = async () => {
    if (!selectedSafari || currentPolygonPoints.length < 3 || !currentUser)
      return;
    try {
      setIsCreating(true);
      const createdPolygon = (await databases.createDocument(
        config.dbId,
        config.polygonCollectionId,
        ID.unique(),
        {
          title: "Polygon",
          safariId: selectedSafari.$id,
          points: currentPolygonPoints.map((p) => JSON.stringify(p)),
          altitude: altitude,
          opacity,
          fillColor,
          strokeColor,
        },
        [
          Permission.delete(Role.user(currentUser.$id)),
          Permission.update(Role.user(currentUser.$id)),
        ]
      )) as SafariPolygon;

      setSafariPolygons((prev) => [...prev, createdPolygon]);
      setCurrentPolygonId(null);
      setCurrentPolygonPoints([]);
    } catch (error) {
      toast({
        title: "Error Creating Polygon",
        description: "Something went wrong.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const isCurrentMode = currentPolygonId && currentPolygonPoints.length > 2;
  return (
    <div className="rounded-md shadow-md bg-white p-4 w-[500px] grow overflow-auto">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <h2 className="font-semibold">Polygon Controls</h2>
          <Badge variant="outline">
            {isCurrentMode ? "Edit Mode" : "Create Mode"}
          </Badge>
        </div>
        <Button variant="outline" size="icon" onClick={() => setOpen(false)}>
          <X />
        </Button>
      </div>
      {polygonPoints.length > 0 && !isCurrentMode && (
        <div className="flex flex-col gap-2 mt-4">
          {polygonPoints.map((p, i) => (
            <div key={`${p.latitude}${p.longitude}${i}`}>
              <GroundPoint point={p} />
            </div>
          ))}
        </div>
      )}

      {!isCurrentMode && polygonPoints.length < 1 && (
        <div className="p-4 mt-4 text-center text-gray-600">
          Click on where you want the corners of your polygon to be.
        </div>
      )}
      {isCurrentMode && (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Stroke Color</Label>
            <Input
              type="color"
              value={strokeColor}
              onChange={(e) => {
                setStrokeColor(e.target.value);
                if (currentPolygonId && map) {
                  removeElementsWithSelector(`#${currentPolygonId}`);
                  createPolygon(
                    map,
                    currentPolygonPoints,
                    altitude,
                    currentPolygonId,
                    e.target.value,
                    hexToRGBA(fillColor, opacity)
                  );
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Fill Color</Label>
            <Input
              type="color"
              value={fillColor}
              onChange={(e) => {
                setFillColor(e.target.value);
                if (currentPolygonId && map) {
                  removeElementsWithSelector(`#${currentPolygonId}`);

                  createPolygon(
                    map,
                    currentPolygonPoints,
                    altitude,
                    currentPolygonId,
                    strokeColor,
                    hexToRGBA(e.target.value, opacity)
                  );
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Opacity</Label>
            <Slider
              value={[opacity]}
              max={0.5}
              step={0.1}
              min={0.1}
              onValueChange={(val) => {
                setOpacity(val[0]);
                if (currentPolygonId && map) {
                  removeElementsWithSelector(`#${currentPolygonId}`);
                  createPolygon(
                    map,
                    currentPolygonPoints,
                    altitude,
                    currentPolygonId,
                    strokeColor,
                    hexToRGBA(fillColor, val[0])
                  );
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Adjust Polygon Height</Label>
            <Slider
              value={[altitude]}
              max={250}
              step={1}
              onValueChange={(val) => {
                setAltitude(val[0]);
                if (currentPolygonId && map) {
                  removeElementsWithSelector(`#${currentPolygonId}`);
                  createPolygon(
                    map,
                    currentPolygonPoints,
                    val[0],
                    currentPolygonId,
                    strokeColor,
                    hexToRGBA(fillColor, opacity)
                  );
                }
              }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end mt-4">
        {!isCurrentMode && (
          <>
            <Button
              variant="outline"
              disabled={polygonPoints.length < 1}
              onClick={() => {
                if (map) {
                  removeElementsWithClass(POLYGON_POINT);
                  setPolygonPoints([]);
                }
              }}
            >
              Clear Points
            </Button>
            <Button
              disabled={polygonPoints.length < 3}
              onClick={() => {
                if (map) {
                  removeElementsWithClass(POLYGON_POINT);
                  const id = generateValidId();
                  setCurrentPolygonId(id);

                  createPolygon(map, polygonPoints, altitude, id);
                  setCurrentPolygonPoints(polygonPoints);
                  setPolygonPoints([]);
                }
              }}
            >
              Create Polygon
            </Button>
          </>
        )}

        {isCurrentMode && (
          <>
            <Button
              variant="outline"
              onClick={() => {
                removeElementsWithSelector(`#${currentPolygonId}`);
                setCurrentPolygonId(null);
                setCurrentPolygonPoints([]);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={currentPolygonPoints.length < 3 || isCreating}
              onClick={handleSavePolygon}
            >
              Save
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
